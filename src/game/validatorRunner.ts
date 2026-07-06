import type {ValidationResult} from './result';

export type Validator<T> = (value: T) => ValidationResult;

function runValidatorsFromIndex<T>(
    validators: Validator<T>[],
    value: T,
    index: number
): ValidationResult {
    if (index >= validators.length) {
        return { isValid: true };
    }
    const result = validators[index](value);
    return result.isValid
        ? runValidatorsFromIndex(validators, value, index + 1)
        : result;
}

export function runValidators<T>(
    validators: Validator<T>[],
    value: T
): ValidationResult {
    return runValidatorsFromIndex(validators, value, 0);
}