/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SelectField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { API } from "aws-amplify";
import { createTodoSubscription } from "../graphql/mutations";
export default function TodoSubscriptionCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    email: "",
    status: "",
    stripeId: "",
    from: "",
    to: "",
  };
  const [email, setEmail] = React.useState(initialValues.email);
  const [status, setStatus] = React.useState(initialValues.status);
  const [stripeId, setStripeId] = React.useState(initialValues.stripeId);
  const [from, setFrom] = React.useState(initialValues.from);
  const [to, setTo] = React.useState(initialValues.to);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setEmail(initialValues.email);
    setStatus(initialValues.status);
    setStripeId(initialValues.stripeId);
    setFrom(initialValues.from);
    setTo(initialValues.to);
    setErrors({});
  };
  const validations = {
    email: [{ type: "Required" }, { type: "Email" }],
    status: [{ type: "Required" }],
    stripeId: [],
    from: [],
    to: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          email,
          status,
          stripeId,
          from,
          to,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await API.graphql({
            query: createTodoSubscription.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "TodoSubscriptionCreateForm")}
      {...rest}
    >
      <TextField
        label="Email"
        isRequired={true}
        isReadOnly={false}
        value={email}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email: value,
              status,
              stripeId,
              from,
              to,
            };
            const result = onChange(modelFields);
            value = result?.email ?? value;
          }
          if (errors.email?.hasError) {
            runValidationTasks("email", value);
          }
          setEmail(value);
        }}
        onBlur={() => runValidationTasks("email", email)}
        errorMessage={errors.email?.errorMessage}
        hasError={errors.email?.hasError}
        {...getOverrideProps(overrides, "email")}
      ></TextField>
      <SelectField
        label="Status"
        placeholder="Please select an option"
        isDisabled={false}
        value={status}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              status: value,
              stripeId,
              from,
              to,
            };
            const result = onChange(modelFields);
            value = result?.status ?? value;
          }
          if (errors.status?.hasError) {
            runValidationTasks("status", value);
          }
          setStatus(value);
        }}
        onBlur={() => runValidationTasks("status", status)}
        errorMessage={errors.status?.errorMessage}
        hasError={errors.status?.hasError}
        {...getOverrideProps(overrides, "status")}
      >
        <option
          children="Inactive"
          value="INACTIVE"
          {...getOverrideProps(overrides, "statusoption0")}
        ></option>
        <option
          children="Active"
          value="ACTIVE"
          {...getOverrideProps(overrides, "statusoption1")}
        ></option>
      </SelectField>
      <TextField
        label="Stripe id"
        isRequired={false}
        isReadOnly={false}
        value={stripeId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              status,
              stripeId: value,
              from,
              to,
            };
            const result = onChange(modelFields);
            value = result?.stripeId ?? value;
          }
          if (errors.stripeId?.hasError) {
            runValidationTasks("stripeId", value);
          }
          setStripeId(value);
        }}
        onBlur={() => runValidationTasks("stripeId", stripeId)}
        errorMessage={errors.stripeId?.errorMessage}
        hasError={errors.stripeId?.hasError}
        {...getOverrideProps(overrides, "stripeId")}
      ></TextField>
      <TextField
        label="From"
        isRequired={false}
        isReadOnly={false}
        type="date"
        value={from}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              status,
              stripeId,
              from: value,
              to,
            };
            const result = onChange(modelFields);
            value = result?.from ?? value;
          }
          if (errors.from?.hasError) {
            runValidationTasks("from", value);
          }
          setFrom(value);
        }}
        onBlur={() => runValidationTasks("from", from)}
        errorMessage={errors.from?.errorMessage}
        hasError={errors.from?.hasError}
        {...getOverrideProps(overrides, "from")}
      ></TextField>
      <TextField
        label="To"
        isRequired={false}
        isReadOnly={false}
        type="date"
        value={to}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              status,
              stripeId,
              from,
              to: value,
            };
            const result = onChange(modelFields);
            value = result?.to ?? value;
          }
          if (errors.to?.hasError) {
            runValidationTasks("to", value);
          }
          setTo(value);
        }}
        onBlur={() => runValidationTasks("to", to)}
        errorMessage={errors.to?.errorMessage}
        hasError={errors.to?.hasError}
        {...getOverrideProps(overrides, "to")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
