import { validateBasicEquationStructure } from './basicValidators';
import type { ValidationResult } from './result';
import type { Token } from './types';

export function validateEquation(equation: Token[]): ValidationResult {
    const basicValidationResult =
        validateBasicEquationStructure(equation);

    if (!basicValidationResult.isValid)
        return basicValidationResult;

    throw new Error('Not implemented yet.');
}