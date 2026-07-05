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
