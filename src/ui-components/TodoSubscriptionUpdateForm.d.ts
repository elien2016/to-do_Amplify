/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type TodoSubscriptionUpdateFormInputValues = {
    email?: string;
    status?: string;
    from?: string;
    to?: string;
};
export declare type TodoSubscriptionUpdateFormValidationValues = {
    email?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    from?: ValidationFunction<string>;
    to?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TodoSubscriptionUpdateFormOverridesProps = {
    TodoSubscriptionUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    email?: PrimitiveOverrideProps<TextFieldProps>;
    status?: PrimitiveOverrideProps<SelectFieldProps>;
    from?: PrimitiveOverrideProps<TextFieldProps>;
    to?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TodoSubscriptionUpdateFormProps = React.PropsWithChildren<{
    overrides?: TodoSubscriptionUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    todoSubscription?: any;
    onSubmit?: (fields: TodoSubscriptionUpdateFormInputValues) => TodoSubscriptionUpdateFormInputValues;
    onSuccess?: (fields: TodoSubscriptionUpdateFormInputValues) => void;
    onError?: (fields: TodoSubscriptionUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TodoSubscriptionUpdateFormInputValues) => TodoSubscriptionUpdateFormInputValues;
    onValidate?: TodoSubscriptionUpdateFormValidationValues;
} & React.CSSProperties>;
export default function TodoSubscriptionUpdateForm(props: TodoSubscriptionUpdateFormProps): React.ReactElement;
