class Operator {
    static eq(a: string, b: string): boolean {
        return a === b;
    }
}

type EqualsFunction = (a: string, b: string) => boolean;

enum Opcode {
    INSERT = "insert",
    DELETE = "delete",
    EQUAL = "equal",
    REPLACE = "replace"
}

type OpcodeEntry = [Opcode, number, number, number, number];

type ActionFunction = (
    ic: number, // insertion cost
    dc: number, // deletion cost
    sc: number, // substitution cost
    im: number, // insertion match score
    dm: number, // deletion match score
    sm: number, // substitution match score
    cost: number // cost of substitution (0 if no substitution, 1 if substitution)
) => Opcode;


class SequenceMatcher {
    private seq1: string[] | null;
    private seq2: string[] | null;
    private test: (a: string, b: string) => boolean;
    private actionFunction: ActionFunction;
    private opcodes: OpcodeEntry[] | null;
    private dist: number | null;
    private matchesCount: number | null;

    constructor(
        a: string[] | null = null,
        b: string[] | null = null,
        test: (a: string, b: string) => boolean = Operator.eq,
        actionFunction: ActionFunction = lowestCostAction
    ) {
        this.seq1 = a ?? [];
        this.seq2 = b ?? [];
        this.test = test;
        this.actionFunction = actionFunction;
        this.opcodes = null;
        this.dist = null;
        this.matchesCount = null;
        this.resetObject();
    }

    setSeqs(a: string[], b: string[]): void {
        this.setSeq1(a);
        this.setSeq2(b);
        this.resetObject();
    }

    private resetObject(): void {
        this.opcodes = null;
        this.dist = null;
        this.matchesCount = null;
    }

    setSeq1(a: string[]): void {
        this.seq1 = a;
        this.resetObject();
    }

    setSeq2(b: string[]): void {
        this.seq2 = b;
        this.resetObject();
    }

    getOpcodes(): OpcodeEntry[] {
        if (!this.opcodes) {
            this.opcodes = [];
            const [d, m, opcodes] = editDistanceBackpointer(this.seq1!, this.seq2!, this.actionFunction, this.test);
            if (this.dist !== null && d !== this.dist) throw new Error('Distance mismatch');
            if (this.matchesCount !== null && m !== this.matchesCount) throw new Error('Match count mismatch');
            this.dist = d;
            this.matchesCount = m;
            this.opcodes = opcodes;
        }
        return this.opcodes;
    }

    getMatchingBlocks(): [number, number, number][] {
        const opcodes = this.getOpcodes();
        const matchOpcodes = opcodes.filter((x) => x[0] === Opcode.EQUAL);
        return matchOpcodes.map((opcode) => [opcode[1], opcode[3], opcode[2] - opcode[1]]);
    }

    ratio(): number {
        return 2.0 * this.matches() / (this.seq1!.length + this.seq2!.length);
    }

    quickRatio(): number {
        return this.ratio();
    }

    realQuickRatio(): number {
        return this.ratio();
    }

    private computeDistanceFast(): void {
        const [d, m] = editDistance(this.seq1!, this.seq2!, this.actionFunction, this.test);
        if (this.dist !== null && d !== this.dist) throw new Error('Distance mismatch');
        if (this.matchesCount !== null && m !== this.matchesCount) throw new Error('Match count mismatch');
        this.dist = d;
        this.matchesCount = m;
    }

    distance(): number | null {
        if (this.dist === null) {
            this.computeDistanceFast();
        }
        return this.dist;
    }

    matches(): number {
        if (this.matchesCount === null) {
            this.computeDistanceFast();
        }
        const matchesCount = this.matchesCount;
        if (matchesCount === null) {
            throw new Error('matchesCount is null');
        }
        return matchesCount;
    }
}

function lowestCostAction(
    ic: number, dc: number, sc: number, im: number, dm: number, sm: number, cost: number
): Opcode {
    let bestAction: Opcode | null = null;
    let bestMatchCount: number = -1;
    const minCost = Math.min(ic, dc, sc);

    if (minCost === sc && cost === 0) {
        bestAction = Opcode.EQUAL;
        bestMatchCount = sm;
    } else if (minCost === sc && cost === 1) {
        bestAction = Opcode.REPLACE;
        bestMatchCount = sm;
    } else if (minCost === ic && im > bestMatchCount) {
        bestAction = Opcode.INSERT;
        bestMatchCount = im;
    } else if (minCost === dc && dm > bestMatchCount) {
        bestAction = Opcode.DELETE;
        bestMatchCount = dm;
    } else {
        throw new Error("internal error: invalid lowest cost action");
    }
    return bestAction;
}

function highestMatchAction(
    ic: number, dc: number, sc: number,
    im: number, dm: number, sm: number,
    cost: number
): Opcode {
    let bestAction: Opcode | null = null;
    let lowestCost: number = Infinity;
    const maxMatch = Math.max(im, dm, sm);
    const actions = [
        { match: sm, cost: sc, action: cost === 0 ? Opcode.EQUAL : Opcode.REPLACE },
        { match: im, cost: ic, action: Opcode.INSERT },
        { match: dm, cost: dc, action: Opcode.DELETE }
    ];
    actions.sort((a, b) => a.cost - b.cost);
    for (const { match, cost, action } of actions) {
        if (match === maxMatch && cost < lowestCost) {
            bestAction = action;
            lowestCost = cost;
        }
    }
    if (bestAction === null) {
        throw new Error("internal error: invalid highest match action");
    }
    return bestAction;
}

function editDistance(
    seq1: string[], seq2: string[],
    actionFunction: ActionFunction = lowestCostAction,
    test: EqualsFunction = Operator.eq
): [number, number] {
    const m = seq1.length;
    const n = seq2.length;
    if (seq1 === seq2) return [0, n];
    if (m === 0) return [n, 0];
    if (n === 0) return [m, 0];

    const v0: number[] = new Array(n + 1).fill(0);
    const v1: number[] = new Array(n + 1).fill(0);
    const m0: number[] = new Array(n + 1).fill(0);
    const m1: number[] = new Array(n + 1).fill(0);

    for (let i = 1; i <= n; i++) v0[i] = i;
    for (let i = 1; i <= m; i++) {
        v1[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = test(seq1[i - 1], seq2[j - 1]) ? 0 : 1;
            const insCost = v1[j - 1] + 1;
            const delCost = v0[j] + 1;
            const subCost = v0[j - 1] + cost;
            const insMatch = m1[j - 1];
            const delMatch = m0[j];
            const subMatch = m0[j - 1] + (cost === 0 ? 1 : 0);

            const action = actionFunction(insCost, delCost, subCost, insMatch, delMatch, subMatch, cost);

            if ([Opcode.EQUAL, Opcode.REPLACE].includes(action)) {
                v1[j] = subCost;
                m1[j] = subMatch;
            } else if (action === Opcode.INSERT) {
                v1[j] = insCost;
                m1[j] = insMatch;
            } else if (action === Opcode.DELETE) {
                v1[j] = delCost;
                m1[j] = delMatch;
            } else {
                throw new Error("Invalid dynamic programming option returned!");
            }
        }
        v0.splice(0, v0.length, ...v1);
        m0.splice(0, m0.length, ...m1);
    }
    return [v1[n], m1[n]];
}

function editDistanceBackpointer(
    seq1: string[], seq2: string[],
    actionFunction: ActionFunction = lowestCostAction,
    test: EqualsFunction = Operator.eq
): [number, number, OpcodeEntry[]] {
    const m = seq1.length;
    const n = seq2.length;
    const bp: (Opcode | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));

    const d0: number[] = new Array(n + 1).fill(0);
    const d1: number[] = new Array(n + 1).fill(0);
    const m0: number[] = new Array(n + 1).fill(0);
    const m1: number[] = new Array(n + 1).fill(0);

    //console.error(`Initial dist and matches arrays`, { d0, m0 });

    for (let i = 1; i <= n; i++) {
        d0[i] = i;
        bp[0][i] = Opcode.INSERT;
    }

    for (let i = 1; i <= m; i++) {
        d1[0] = i;
        bp[i][0] = Opcode.DELETE;

        for (let j = 1; j <= n; j++) {
            const cost = test(seq1[i - 1], seq2[j - 1]) ? 0 : 1;
            const insCost = d1[j - 1] + 1;
            const delCost = d0[j] + 1;
            const subCost = d0[j - 1] + cost;
            const insMatch = m1[j - 1];
            const delMatch = m0[j];
            const subMatch = m0[j - 1] + (cost === 0 ? 1 : 0);

            const action = actionFunction(insCost, delCost, subCost, insMatch, delMatch, subMatch, cost);

            //console.error(`Processing cell [${i}][${j}]`, {seq1Char: seq1[i - 1], seq2Char: seq2[j - 1], actions: { insCost, delCost, subCost }, matches: { insMatch, delMatch, subMatch }, chosenAction: action});

            if (action === Opcode.EQUAL || action === Opcode.REPLACE) {
                d1[j] = subCost;
                m1[j] = subMatch;
                bp[i][j] = action;
            } else if (action === Opcode.INSERT) {
                d1[j] = insCost;
                m1[j] = insMatch;
                bp[i][j] = Opcode.INSERT;
            } else if (action === Opcode.DELETE) {
                d1[j] = delCost;
                m1[j] = delMatch;
                bp[i][j] = Opcode.DELETE;
            } else {
                throw new Error("Invalid dynamic programming action returned!");
            }
        }

        //console.error(`Updated dist and matches for row ${i}`, { d1: d1.slice(), m1: m1.slice() });

        d0.splice(0, d0.length, ...d1);
        m0.splice(0, m0.length, ...m1);
    }

    //console.error(`Final distance array:`, d1);
    //console.error(`Final matches array:`, m1);
    //console.error(`Backpointer table:`, bp);

    const opcodes = getOpcodesFromBpTable(bp);
    //console.error(`Generated opcodes:`, opcodes);
    return [d1[n], m1[n], opcodes];
}

function getOpcodesFromBpTable(bp: (Opcode | null)[][]): OpcodeEntry[] {
    let x = bp.length - 1;
    let y = bp[0].length - 1;
    const opcodes: OpcodeEntry[] = [];

    //console.error(`Starting opcode generation from BP table. Starting coordinates: [${x}, ${y}]`);

    while (x !== 0 || y !== 0) {
        const thisBp = bp[x][y];
        //console.error(`Processing BP cell at [${x}, ${y}] with action: ${thisBp}`);

        if (thisBp === Opcode.EQUAL || thisBp === Opcode.REPLACE) {
            opcodes.push([thisBp, Math.max(x - 1, 0), x, Math.max(y - 1, 0), y]);
            //console.error(`Added opcode: [${thisBp}, ${Math.max(x - 1, 0)}, ${x}, ${Math.max(y - 1, 0)}, ${y}]`);
            x -= 1;
            y -= 1;
        } else if (thisBp === Opcode.INSERT) {
            opcodes.push([Opcode.INSERT, x, x, Math.max(y - 1, 0), y]);
            //console.error(`Added opcode: [${Opcode.INSERT}, ${x}, ${x}, ${Math.max(y - 1, 0)}, ${y}]`);
            y -= 1;
        } else if (thisBp === Opcode.DELETE) {
            opcodes.push([Opcode.DELETE, Math.max(x - 1, 0), x, Math.max(y - 1, 0), Math.max(y - 1, 0)]);
            //console.error(`Added opcode: [${Opcode.DELETE}, ${Math.max(x - 1, 0)}, ${x}, ${Math.max(y - 1, 0)}, ${Math.max(y - 1, 0)}]`);
            x -= 1;
        } else {
            //console.error("Encountered invalid action in BP table which is not handled.");
            throw new Error("Invalid dynamic programming action in BP table!");
        }
    }

    //console.error(`Completed opcode generation. Final opcodes:`, opcodes);

    opcodes.reverse();
    return opcodes;
}

export { SequenceMatcher, Opcode, editDistance, editDistanceBackpointer, lowestCostAction, highestMatchAction, Operator };