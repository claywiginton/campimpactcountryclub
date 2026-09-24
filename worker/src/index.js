/**
 * Fußballgolf round store.
 *
 * Two endpoints, both JSON:
 *   GET  /rounds?limit=50   -> recent rounds, newest first, players included
 *   POST /rounds            -> upsert one round (idempotent on the client's round id)
 *
 * The app is offline-first: the phone owns the round while it is being played
 * and pushes it here when there is signal, possibly several times and possibly
 * long after the fact. So writes are upserts keyed by a client-generated id,
 * and arriving twice is normal rather than an error.
 */

const HOLES = 18;
const MAX_BODY = 32 * 1024;
const MAX_PLAYERS = 12;
const MAX_NAME = 40;

const ALLOWED_ORIGINS = [
  "https://claywiginton.github.io",
  "http://localhost:8099"
];

function corsHeaders(origin){
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status, origin){
  return new Response(JSON.stringify(data), {
    status: status,
    headers: Object.assign(
      { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      corsHeaders(origin)
    )
  });
}

/** Returns an error string, or null when the payload is sound. */
function validate(b){
  if(!b || typeof b !== "object" || Array.isArray(b)) return "body must be an object";
  if(typeof b.id !== "string" || !/^[A-Za-z0-9_-]{8,64}$/.test(b.id)) return "id must be 8-64 url-safe characters";
  if(typeof b.played_on !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.played_on)) return "played_on must be YYYY-MM-DD";

  if(!Array.isArray(b.pars) || b.pars.length !== HOLES) return "pars must have " + HOLES + " entries";
  for(var i=0;i<HOLES;i++){
    var par = b.pars[i];
    if(!Number.isInteger(par) || par < 1 || par > 9) return "par on hole " + (i+1) + " out of range";
  }

  if(!Array.isArray(b.players) || b.players.length < 1 || b.players.length > MAX_PLAYERS){
    return "players must be 1-" + MAX_PLAYERS + " entries";
  }
  for(var p=0;p<b.players.length;p++){
    var pl = b.players[p];
    if(!pl || typeof pl !== "object") return "player " + (p+1) + " malformed";
    if(typeof pl.name !== "string") return "player " + (p+1) + " needs a name";
    var name = pl.name.trim();
    if(!name.length || name.length > MAX_NAME) return "player " + (p+1) + " name must be 1-" + MAX_NAME + " characters";
    if(!Array.isArray(pl.scores) || pl.scores.length !== HOLES) return "player " + (p+1) + " needs " + HOLES + " scores";
    for(var h=0;h<HOLES;h++){
      var s = pl.scores[h];
      if(s === null) continue;                       // hole not played
      // the app's own rule: nothing above double par can exist
      if(!Number.isInteger(s) || s < 1 || s > b.pars[h] * 2){
        return "player " + (p+1) + " score on hole " + (h+1) + " out of range";
      }
    }
  }
  return null;
}

function summarise(pars, scores){
  var total = 0, toPar = 0, played = 0;
  for(var h=0;h<HOLES;h++){
    if(scores[h] == null) continue;
    total += scores[h];
    toPar += scores[h] - pars[h];
    played++;
  }
  return { total: total, toPar: toPar, played: played };
}

async function putRound(env, body){
  var pars = body.pars;
  var parTotal = pars.reduce(function(a, b){ return a + b; }, 0);
  var finished = body.players.every(function(pl){
    return pl.scores.every(function(s){ return s !== null; });
  });

  var stmts = [
    env.DB.prepare(
      "INSERT INTO rounds (id, played_on, pars, par_total, hole_count, finished, updated_at) " +
      "VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now')) " +
      "ON CONFLICT(id) DO UPDATE SET played_on=?2, pars=?3, par_total=?4, finished=?6, updated_at=datetime('now')"
    ).bind(body.id, body.played_on, JSON.stringify(pars), parTotal, HOLES, finished ? 1 : 0),
    // players are rewritten wholesale; a re-push is the newer truth
    env.DB.prepare("DELETE FROM round_players WHERE round_id = ?1").bind(body.id)
  ];

  body.players.forEach(function(pl, i){
    var s = summarise(pars, pl.scores);
    stmts.push(env.DB.prepare(
      "INSERT INTO round_players (round_id, position, name, scores, total, to_par, holes_played) " +
      "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
    ).bind(body.id, i, pl.name.trim(), JSON.stringify(pl.scores), s.total, s.toPar, s.played));
  });

  await env.DB.batch(stmts);   // atomic
  return { id: body.id, finished: finished };
}

async function listRounds(env, limit){
  var rounds = await env.DB.prepare(
    "SELECT id, played_on, pars, par_total, finished, updated_at FROM rounds " +
    "ORDER BY played_on DESC, updated_at DESC LIMIT ?1"
  ).bind(limit).all();

  var rows = rounds.results || [];
  if(!rows.length) return [];

  var marks = rows.map(function(_, i){ return "?" + (i + 1); }).join(",");
  var stmt = env.DB.prepare(
    "SELECT round_id, position, name, scores, total, to_par, holes_played FROM round_players " +
    "WHERE round_id IN (" + marks + ") ORDER BY round_id, position"
  );
  // .bind must keep the statement as its receiver
  var players = await stmt.bind.apply(stmt, rows.map(function(r){ return r.id; })).all();

  var byRound = {};
  (players.results || []).forEach(function(p){
    (byRound[p.round_id] = byRound[p.round_id] || []).push({
      name: p.name,
      scores: JSON.parse(p.scores),
      total: p.total,
      to_par: p.to_par,
      holes_played: p.holes_played
    });
  });

  return rows.map(function(r){
    return {
      id: r.id,
      played_on: r.played_on,
      pars: JSON.parse(r.pars),
      par_total: r.par_total,
      finished: !!r.finished,
      updated_at: r.updated_at,
      players: byRound[r.id] || []
    };
  });
}

export default {
  async fetch(request, env){
    var origin = request.headers.get("Origin") || "";
    var url = new URL(request.url);

    if(request.method === "OPTIONS"){
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if(url.pathname === "/health"){
      return json({ ok: true }, 200, origin);
    }
    if(url.pathname !== "/rounds"){
      return json({ error: "not found" }, 404, origin);
    }

    try {
      if(request.method === "GET"){
        var limit = parseInt(url.searchParams.get("limit") || "50", 10);
        if(!Number.isFinite(limit) || limit < 1) limit = 50;
        if(limit > 100) limit = 100;
        return json({ rounds: await listRounds(env, limit) }, 200, origin);
      }

      if(request.method === "POST"){
        var raw = await request.text();
        if(raw.length > MAX_BODY) return json({ error: "payload too large" }, 413, origin);

        var body;
        try { body = JSON.parse(raw); }
        catch(e){ return json({ error: "invalid JSON" }, 400, origin); }

        var problem = validate(body);
        if(problem) return json({ error: problem }, 422, origin);

        return json(await putRound(env, body), 200, origin);
      }
    } catch(err){
      return json({ error: "server error", detail: String(err && err.message || err) }, 500, origin);
    }

    return json({ error: "method not allowed" }, 405, origin);
  }
};
