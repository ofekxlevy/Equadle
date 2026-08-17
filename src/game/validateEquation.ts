import { validateBasicEquationStructure } from './basicValidators';
import type { ValidationResult } from './result';
import type { Token } from './types';
import { parseEquation } from './expressionParser';
import { makeInvalidResult, makeValidResult } from './result';
import { evaluateExpression } from './expressionEvaluator';

export function validateEquation(equation: Token[]): ValidationResult {
    
    // Basic structural validation

    const basicValidationResult = validateBasicEquationStructure(equation);

    if (!basicValidationResult.isValid)
        return basicValidationResult;


    // Parse equation

    const parseResult = parseEquation(equation);

    if (!parseResult.isValid)
        return makeInvalidResult(parseResult.reason);


    // Evaluate left-side expression

    const evaluationResult = evaluateExpression(parseResult.value.exp);

    if (!evaluationResult.isValid)
        return makeInvalidResult(evaluationResult.reason);


    // Compare evaluated value with expected result

    return evaluationResult.value === parseResult.value.expected
        ? makeValidResult()
        : makeInvalidResult('Left side does not equal right side.');


}