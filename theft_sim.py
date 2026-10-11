import numpy as np
rng = np.random.default_rng(7)
T = 90                      # minutes simulated
NOISE = 0.01                # 1% (1-sigma) per-node measurement error (CT + ADC)
THR, N_OF_M = 0.04, (3, 5)  # 4% mismatch, persistent in 3 of last 5 windows

# edge: (name, children, consumer_leaf, r) ; r = loss coeff (kW lost per kW^2)
E = {
 "S0:T0-P1": (["S1:P1-P2", "D1:P1-C1"], None, 0.0020),
 "S1:P1-P2": (["S2:P2-P3", "D2:P2-C2"], None, 0.0030),
 "S2:P2-P3": (["D3:P3-C3", "D4:P3-C4"], None, 0.0030),
 "D1:P1-C1": ([], "C1", 0.0010), "D2:P2-C2": ([], "C2", 0.0010),
 "D3:P3-C3": ([], "C3", 0.0010), "D4:P3-C4": ([], "C4", 0.0010),
}
base = {"C1": 1.2, "C2": 0.8, "C3": 2.0, "C4": 1.5}
def theft(e, t):            # kW stolen on each edge (upstream of consumer meter)
    if e == "S1:P1-P2" and t >= 30: return 2.5   # hooking on the span
    if e == "D3:P3-C3" and t >= 60: return 1.0   # tap on service drop
    return 0.0

def true_send(e, load, t):
    ch, leaf, r = E[e]
    down = load[leaf] if leaf else sum(true_send(c, load, t) for c in ch)
    down += theft(e, t)
    return down + r * down**2

alerts, hist = {}, {e: [] for e in E}
for t in range(T):
    load = {c: max(0.2, p + rng.normal(0, 0.1)) for c, p in base.items()}
    S = {e: true_send(e, load, t) * (1 + rng.normal(0, NOISE)) for e in E}
    M = {c: load[c] * (1 + rng.normal(0, NOISE)) for c in load}
    for e, (ch, leaf, r) in E.items():
        exp_rx = M[leaf] if leaf else sum(S[c] for c in ch)
        d = S[e] - exp_rx - r * exp_rx**2
        hist[e].append(d / S[e] > THR)
        if sum(hist[e][-N_OF_M[1]:]) >= N_OF_M[0] and (e, "x") not in alerts:
            alerts[(e, "x")] = t
for (e, _), t in alerts.items():
    print(f"ALERT t={t:2d} min  segment {e}")
print("false alarms before t=30:", [k[0] for k, t in alerts.items() if t < 30])
