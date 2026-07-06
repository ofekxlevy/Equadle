export type ValidationResult =
    | { isValid: true }
    | { isValid: false; reason: string }
;

export function makeValidResult(): ValidationResult {
    return { isValid: true };
}

export function makeInvalidResult(reason: string): ValidationResult {
    return { isValid: false, reason };
}

export type EvaluationResult = 
    | { isValid: true; value: number }
    | { isValid: false; reason: string }
;

export function makeValidEvaluationResult(value: number): EvaluationResult {
    return { isValid: true, value };
}

export function makeInvalidEvaluationResult(reason: string): EvaluationResult {
    return { isValid: false, reason };
}
