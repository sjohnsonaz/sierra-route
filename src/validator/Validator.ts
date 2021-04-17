import { ValidationError, ValidationMessage } from '../schema/ValidationError';

export class Validator<T extends Record<string, StringConstructor | NumberConstructor>> {
    validators: T;

    constructor(validators: T) {
        this.validators = validators;
    }

    run<U extends []>(...args: U): ValidationResult<T> {
        const result: ValidationResult<T> = {} as any;
        const entries: Entries<T> = Object.entries(this.validators) as any;
        return entries.reduce((result, [key, validator], index) => {
            let _validator: typeof validateString | typeof validateNumber;
            switch (validator) {
                case Number:
                    _validator = validateNumber;
                    break;
                case String:
                default:
                    _validator = validateString;
                    break;
            }
            result[key] = _validator(args[index], key) as any;
            return result;
        }, result);
    }

    parse = (...args: any) => this.run(...args);
}

type ValidationResult<T extends Record<string, StringConstructor | NumberConstructor>> = {
    [Property in keyof T]: T[Property] extends NumberConstructor ? number : string;
};

function validateString(value: string | undefined, property: string | number | symbol) {
    if (typeof value === 'string') {
        return value;
    } else {
        throw new ValidationError(ValidationMessage.NotAString, property);
    }
}

function validateNumber(value: number | undefined, property: string | number | symbol) {
    const result = Number(value);
    if (!isNaN(result) && isFinite(result)) {
        return result;
    } else {
        throw new ValidationError(ValidationMessage.NotANumber, property);
    }
}

export function createValidator<T extends Record<string, StringConstructor | NumberConstructor>>(validators: T) {
    const validator = new Validator(validators);
    return validator.parse;
}

export type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];
