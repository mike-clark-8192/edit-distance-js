import { editDistance, editDistanceBackpointer, SequenceMatcher, highestMatchAction } from '../src/edit-distance'; // Adjust import path as needed

describe('TestEditDistance', () => {
  test('test_edit_distance0', () => {
    const a = ['a', 'b'];
    const b = ['d', 'a', 'b'];
    expect(editDistance(a, b)).toEqual([1, 2]);
    const bpExpectedResult = [
      1,
      2,
      [
        ['insert', 0, 0, 0, 1],
        ['equal', 0, 1, 1, 2],
        ['equal', 1, 2, 2, 3],
      ],
    ];
    expect(editDistanceBackpointer(a, b)).toEqual(bpExpectedResult);
  });

  test('test_edit_distance1', () => {
    const a = ['a', 'b'];
    const b = ['a', 'c', 'd', 'a', 'b'];
    expect(editDistance(a, b)).toEqual([3, 2]);
    const bpExpectedResult = [
      3,
      2,
      [
        ['insert', 0, 0, 0, 1],
        ['insert', 0, 0, 1, 2],
        ['insert', 0, 0, 2, 3],
        ['equal', 0, 1, 3, 4],
        ['equal', 1, 2, 4, 5],
      ],
    ];
    expect(editDistanceBackpointer(a, b)).toEqual(bpExpectedResult);
  });

  test('test_edit_distance2', () => {
    const a = 'hi my name is andy'.split(' ');
    const b = "hi i'm my name's sandy".split(' ');
    expect(editDistance(a, b)).toEqual([4, 1]);
    const bpExpectedResult = [
      4,
      1,
      [
        ['equal', 0, 1, 0, 1],
        ['replace', 1, 2, 1, 2],
        ['replace', 2, 3, 2, 3],
        ['replace', 3, 4, 3, 4],
        ['replace', 4, 5, 4, 5],
      ],
    ];
    expect(editDistanceBackpointer(a, b)).toEqual(bpExpectedResult);
  });

  test('test_edit_distance_highest_match', () => {
    const a = 'hi my name is andy'.split(' ');
    const b = "hi i'm my name's sandy".split(' ');
    expect(editDistance(a, b, highestMatchAction)).toEqual([4, 2]);
    const bpExpectedResult = [
      4,
      2,
      [
        ['equal', 0, 1, 0, 1],
        ['insert', 1, 1, 1, 2],
        ['equal', 1, 2, 2, 3],
        ['delete', 2, 3, 2, 2],
        ['replace', 3, 4, 3, 4],
        ['replace', 4, 5, 4, 5],
      ],
    ];
    expect(editDistanceBackpointer(a, b, highestMatchAction)).toEqual(bpExpectedResult);
  });

  test('test_sequence_matcher', () => {
    const a = ['a', 'b'];
    const b = ['a', 'b', 'd', 'c'];
    const sm = new SequenceMatcher(a, b);
    const opcodes = [
      ['equal', 0, 1, 0, 1],
      ['equal', 1, 2, 1, 2],
      ['insert', 2, 2, 2, 3],
      ['insert', 2, 2, 3, 4],
    ];
    expect(sm.distance()).toEqual(2);
    expect(sm.ratio()).toBeCloseTo(2 / 3);
    expect(sm.quickRatio()).toBeCloseTo(2 / 3);
    expect(sm.realQuickRatio()).toBeCloseTo(2 / 3);
    expect(sm.getOpcodes()).toEqual(opcodes);
    expect(sm.getMatchingBlocks()).toEqual([[0, 0, 1], [1, 1, 1]]);
  });

  test('test_sequence_matcher2', () => {
    const a = ['a', 'b'];
    const b = ['a', 'b', 'd', 'c'];
    const sm = new SequenceMatcher();
    sm.setSeq1(a);
    sm.setSeq2(b);
    expect(sm.distance()).toEqual(2);
    sm.setSeqs(b, a);
    expect(sm.distance()).toEqual(2);
  });
});

test('test_issue4_simpler', () => {
  const a = ['that', 'continuous', 'sanction', ':=', '('];
  const b = ['continuous', ':=', '(', 'sanction', '^'];
  const sm = new SequenceMatcher(a, b);
  expect(sm.distance()).toEqual(4);
  const targetOpcodes = [
      ['delete', 0, 1, 0, 0],
      ['equal', 1, 2, 0, 1],
      ['delete', 2, 3, 0, 0],
      ['equal', 3, 4, 1, 2],
      ['equal', 4, 5, 2, 3],
      ['insert', 5, 5, 3, 4],
      ['insert', 5, 5, 4, 5],
  ];
  expect(sm.getOpcodes()).toEqual(targetOpcodes);
});

test('test_issue4', () => {
  const a = ["that", "continuous", "sanction", ":=", "(", "flee", "U", "complain", ")", "E", "attendance", "eye", "^", "flowery", "revelation", "^", "ridiculous", "destination", "<EOS>"].concat(Array(10).fill("<EOS>"));
  const b = ["continuous", ":=", "(", "sanction", "^", "flee", "^", "attendance"].concat(Array(20).fill("<EOS>"));
  const sm = new SequenceMatcher(a, b);
  expect(sm.distance()).toEqual(16);
  const targetOpcodes = [
      ["delete", 0, 1, 0, 0],
      ["equal", 1, 2, 0, 1],
      ["delete", 2, 3, 0, 0],
      ["equal", 3, 4, 1, 2],
      ["equal", 4, 5, 2, 3],
      ["insert", 5, 5, 3, 4],
      ["insert", 5, 5, 4, 5],
      ["equal", 5, 6, 5, 6],
      ["replace", 6, 7, 6, 7],
      ["replace", 7, 8, 7, 8],
      ["replace", 8, 9, 8, 9],
      ["replace", 9, 10, 9, 10],
      ["replace", 10, 11, 10, 11],
      ["replace", 11, 12, 11, 12],
      ["replace", 12, 13, 12, 13],
      ["replace", 13, 14, 13, 14],
      ["replace", 14, 15, 14, 15],
      ["replace", 15, 16, 15, 16],
      ["replace", 16, 17, 16, 17],
      ["replace", 17, 18, 17, 18],
      ["equal", 18, 19, 18, 19],
      ["equal", 19, 20, 19, 20],
      ["equal", 20, 21, 20, 21],
      ["equal", 21, 22, 21, 22],
      ["equal", 22, 23, 22, 23],
      ["equal", 23, 24, 23, 24],
      ["equal", 24, 25, 24, 25],
      ["equal", 25, 26, 25, 26],
      ["equal", 26, 27, 26, 27],
      ["equal", 27, 28, 27, 28],
      ["equal", 28, 29, 28, 29]
  ];
  expect(sm.getOpcodes()).toEqual(targetOpcodes);
});

test('test_issue13', () => {
  const a = "abc".split("");
  const b = "abdc".split("");
  const sm = new SequenceMatcher(a, b);
  expect(sm.getOpcodes()).toEqual([
      ["equal", 0, 1, 0, 1],
      ["equal", 1, 2, 1, 2],
      ["insert", 2, 2, 2, 3],
      ["equal", 2, 3, 3, 4],
  ]);
});
