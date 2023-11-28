/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TodoSubscriptionCreateFormInputValues = {
    email?: string;
    status?: string;
    stripeId?: string;
    from?: string;
    to?: string;
    autoRenew?: boolean;
};
export declare type TodoSubscriptionCreateFormValidationValues = {
    email?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    stripeId?: ValidationFunction<string>;
    from?: ValidationFunction<string>;
    to?: ValidationFunction<string>;
    autoRenew?: ValidationFunction<boolean>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TodoSubscriptionCreateFormOverridesProps = {
    TodoSubscriptionCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    email?: PrimitiveOverrideProps<TextFieldProps>;
    status?: PrimitiveOverrideProps<SelectFieldProps>;
    stripeId?: PrimitiveOverrideProps<TextFieldProps>;
    from?: PrimitiveOverrideProps<TextFieldProps>;
    to?: PrimitiveOverrideProps<TextFieldProps>;
    autoRenew?: PrimitiveOverrideProps<SwitchFieldProps>;
} & EscapeHatchProps;
export declare type TodoSubscriptionCreateFormProps = React.PropsWithChildren<{
    overrides?: TodoSubscriptionCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: TodoSubscriptionCreateFormInputValues) => TodoSubscriptionCreateFormInputValues;
    onSuccess?: (fields: TodoSubscriptionCreateFormInputValues) => void;
    onError?: (fields: TodoSubscriptionCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TodoSubscriptionCreateFormInputValues) => TodoSubscriptionCreateFormInputValues;
    onValidate?: TodoSubscriptionCreateFormValidationValues;
} & React.CSSProperties>;
export default function TodoSubscriptionCreateForm(props: TodoSubscriptionCreateFormProps): React.ReactElement;
