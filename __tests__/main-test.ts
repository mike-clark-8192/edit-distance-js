import {
  editDistance,
  editDistanceBackpointer,
  SequenceMatcher,
  highestMatchAction,
  lowestCostAction,
  Operator,
  OpCode,
} from '../src/edit-distance'; // Adjust import path as needed

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
    expect(editDistance(a, b, highestMatchAction, Operator.eq)).toEqual([4, 2]);
    const bpExpectedResult = [
      4,
      2,
      [
        ['equal', 0, 1, 0, 1],
        ['insert', 1, 1, 1, 2],
        ['equal', 1, 2, 2, 3],
        ['delete', 2, 3, 2, 2],  // Correctly reflecting the original Python test
        ['replace', 3, 4, 3, 4],
        ['replace', 4, 5, 4, 5],
      ],
    ];
    expect(editDistanceBackpointer(a, b, highestMatchAction, Operator.eq)).toEqual(bpExpectedResult);
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
  const b = ["continuous", ":=", "(", "sanction", "^", "flee", "^", "attendance"].concat(Array(21).fill("<EOS>"));
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

describe('highestMatchAction Functionality', () => {
  test('should prefer substitution when substitution has the highest match and lowest cost', () => {
    const result = highestMatchAction(3, 3, 1, 0, 0, 2, 1); // Assuming substitution cost is 1 and match is 2
    expect(result).toEqual(OpCode.REPLACE);
  });

  test('should prefer insertion when insertion has the highest match score despite higher cost', () => {
    const result = highestMatchAction(1, 3, 2, 3, 1, 1, 1); // Insertion cost is 1, match is 3
    expect(result).toEqual(OpCode.INSERT);
  });

  test('should prefer deletion when deletion has the highest match score and equal cost', () => {
    const result = highestMatchAction(2, 2, 3, 1, 2, 1, 1); // Deletion cost and substitution cost are equal, deletion match is highest
    expect(result).toEqual(OpCode.DELETE);
  });

  test('should select equal when substitution cost is zero and it matches perfectly', () => {
    const result = highestMatchAction(1, 1, 0, 0, 0, 5, 0); // No cost for substitution and high match score
    expect(result).toEqual(OpCode.EQUAL);
  });

  test('should handle tie by choosing the operation with lower cost', () => {
    const result = highestMatchAction(1, 2, 1, 3, 3, 3, 1);
    expect(result).toEqual(OpCode.REPLACE);
  });

  test('should handle tie in match and cost by choosing the first in order (insert, delete, replace)', () => {
    const result = highestMatchAction(2, 2, 2, 4, 4, 4, 1); // All options have same cost and match score
    expect(result).toEqual(OpCode.REPLACE);
  });

  // Add more tests as needed to cover all logical branches and edge cases.
});

describe('lowestCostAction Functionality', () => {
  test('should return EQUAL when substitution cost is lowest and cost is zero', () => {
    expect(lowestCostAction(2, 3, 1, 1, 1, 4, 0)).toEqual(OpCode.EQUAL);
  });

  test('should return REPLACE when substitution cost is lowest and cost is one', () => {
    expect(lowestCostAction(2, 3, 1, 1, 1, 4, 1)).toEqual(OpCode.REPLACE);
  });

  test('should return INSERT when insertion has the lowest cost and highest match', () => {
    expect(lowestCostAction(1, 3, 2, 5, 1, 1, 1)).toEqual(OpCode.INSERT);
  });

  test('should return DELETE when deletion has the lowest cost and highest match', () => {
    expect(lowestCostAction(3, 1, 2, 1, 5, 1, 1)).toEqual(OpCode.DELETE);
  });

  test('should choose the operation with the lowest cost when match scores are equal', () => {
    expect(lowestCostAction(1, 2, 3, 4, 4, 4, 1)).toEqual(OpCode.INSERT);
  });

  test('should prioritize lower cost even if match scores are high', () => {
    expect(lowestCostAction(1, 2, 3, 6, 7, 8, 1)).toEqual(OpCode.INSERT);
  });

  // this test should probably expect OpCode.DELETE because it has the lowest cost, however, the original Python code
  // does not evaluate all scores concurrently (rather, it branches on the first condition that is met), so this test
  // is written to match the "as implemented" behavior
  test('should handle ties in cost by choosing the first valid match score criteria met', () => {
    // All costs are the same but different match scores
    expect(lowestCostAction(2, 2, 2, 3, 5, 1, 1)).toEqual(OpCode.REPLACE);
  });
});

import * as fs from 'fs';
import * as path from 'path';

describe('long sequences', () => {
  it('should handle long sequences', () => {
    const jsonFilePath = path.join(__dirname, 'long-sequences.json');
    const jsonStr = fs.readFileSync(jsonFilePath, 'utf8');
    const data = JSON.parse(jsonStr);
    const a = data.a;
    const b = data.b;
    const expectedEditDistance = data.expected_edit_distance;
    const expectedMatchCount = data.expected_match_count;
    const sm = new SequenceMatcher(a, b);
    expect(sm.distance()).toEqual(expectedEditDistance);
    expect(sm.getMatchingBlocks().length).toEqual(expectedMatchCount);
    expect(sm.getOpcodes()).toEqual(data.expected_bp_opcodes);
  });
});
