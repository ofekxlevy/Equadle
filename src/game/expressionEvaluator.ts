/**
 * Expression evaluator for Equadle.
 *
 * This file is responsible for evaluating the abstract syntax tree (AST)
 * produced by expressionParser.ts. It receives an Exp value and recursively
 * computes the numeric value represented by that expression.
 *
 * The evaluator supports all expression types defined in expressionAst.ts:
 *
 *     NumExp      - returns the stored numeric value;
 *     SquareExp   - evaluates the inner expression and squares its result;
 *     AddExp      - evaluates both operands and adds their values;
 *     SubExp      - evaluates both operands and subtracts the right value
 *                   from the left value;
 *     MulExp      - evaluates both operands and multiplies their values;
 *     DivExp      - evaluates both operands and divides the left value by
 *                   the right value.
 *
 * Evaluation is recursive. For a compound expression, the evaluator first
 * evaluates its child expressions. Only after both child expressions have
 * been evaluated successfully does it apply the corresponding mathematical
 * operation.
 *
 * For example, the AST representing:
 *
 *     (5 * 2) + (3 - 1)
 *
 * is evaluated in the following order:
 *
 *     1. Evaluate 5 * 2 to obtain 10.
 *     2. Evaluate 3 - 1 to obtain 2.
 *     3. Add the two results to obtain 12.
 *
 * Binary operations that share the same evaluation pattern use the internal
 * evaluateBinaryExpression helper. This helper:
 *
 *     1. Evaluates the left operand.
 *     2. Returns immediately if the left evaluation fails.
 *     3. Evaluates the right operand.
 *     4. Returns immediately if the right evaluation fails.
 *     5. Applies the provided numeric operation to the two evaluated values.
 *
 * Division is handled separately because it requires an additional semantic
 * check. After evaluating the right operand, the evaluator verifies that its
 * value is not zero before performing the division. The check is performed
 * on the evaluated value, so expressions such as 10 / (3 - 3) are rejected
 * even though the right operand is not directly NumExp(0).
 *
 * The evaluator does not throw exceptions for expected evaluation errors.
 * Instead, it returns an EvaluationResult:
 *
 *     { isValid: true, value: number }
 *
 * when evaluation succeeds, or:
 *
 *     { isValid: false, reason: string }
 *
 * when evaluation fails. This makes errors explicit and allows failures to be
 * propagated through recursive calls without interrupting the program.
 *
 * The main public function exported by this file is:
 *
 *     evaluateExpression(exp: Exp): EvaluationResult
 */

import type { Exp } from './expressionAst';
import { isNumExp, isSquareExp, isAddExp, isMulExp, isSubExp, isDivExp } from './expressionAst';
import type { EvaluationResult } from './result';
import {
    makeInvalidEvaluationResult,
    makeValidEvaluationResult,
} from './result';

type BinaryOperation = (left: number, right: number) => number;

/**
 * Evaluates an expression AST and returns its numeric value.
 * Evaluation errors, such as division by zero, are represented by an
 * invalid EvaluationResult instead of throwing an exception.
 */
export function evaluateExpression(exp: Exp): EvaluationResult {
    if (isNumExp(exp)) 
        return makeValidEvaluationResult(exp.value);

    if (isSquareExp(exp)) {
        const innerResult = evaluateExpression(exp.exp);
        return innerResult.isValid
            ? makeValidEvaluationResult(innerResult.value ** 2)
            : innerResult;
    }
    
    if (isAddExp(exp)) 
        return evaluateBinaryExpression(exp.left, exp.right, 
            (l, r) => l + r);
    

    if (isSubExp(exp)) 
        return evaluateBinaryExpression(exp.left, exp.right,
            (left, right) => left - right);
    

    if (isMulExp(exp)) 
        return evaluateBinaryExpression(exp.left, exp.right,
            (left, right) => left * right);
    
    if (isDivExp(exp)) {
        const leftResult = evaluateExpression(exp.left);
        if (!leftResult.isValid)
            return leftResult;

        const rightResult = evaluateExpression(exp.right);
        if (!rightResult.isValid)
            return rightResult;

        if (rightResult.value === 0)
            return makeInvalidEvaluationResult('Division by zero.');

        return makeValidEvaluationResult(leftResult.value / rightResult.value);
    }

    return makeInvalidEvaluationResult(
        `Evaluation is not implemented yet`
    );
}

function evaluateBinaryExpression(left: Exp, right: Exp, operation: BinaryOperation): EvaluationResult {
    const leftResult = evaluateExpression(left);
    if (!leftResult.isValid)
        return leftResult;

    const rightResult = evaluateExpression(right);
    if (!rightResult.isValid)
        return rightResult;

    return makeValidEvaluationResult(
        operation(leftResult.value, rightResult.value)
    );
}