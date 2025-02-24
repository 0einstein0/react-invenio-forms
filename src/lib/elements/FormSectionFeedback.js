import React from "react";
import PropTypes from "prop-types";
import { Message, Icon } from "semantic-ui-react";

const formatFieldName = (fieldName) => {
  let cleanedField = fieldName.includes(":")
    ? fieldName.split(":").pop() 
    : fieldName;

  return cleanedField
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ") 
    .replace(/^\w/, (c) => c.toUpperCase());
};

const extractErrors = (error, parentKey = "") => {
  if (typeof error === "string") {
    return [{ key: parentKey, message: error }]; 
  } else if (Array.isArray(error)) {
    return error.flatMap((item) => extractErrors(item, parentKey));
  } else if (typeof error === "object") {
    return Object.entries(error).flatMap(([key, value]) => {
      const formattedKey = formatFieldName(key);
      return extractErrors(value, formattedKey);
    });
  }
  return [];
};

const FormSectionFeedback = ({ errors }) => {
    
  return (
    Object.keys(errors).length > 0 && (
      <Message negative>
        <Message.Content>
          {Object.entries(errors).flatMap(([path, error]) => {
            // Get the last segment of the path (e.g., remove "metadata.")
            const pathSegments = path.split(".");
            const fieldName = pathSegments[pathSegments.length - 1]; // Get the last part only
            const formattedFieldName = formatFieldName(fieldName); // Format the last part
            

            const errorMessages = extractErrors(error, formattedFieldName); // Pass the field name

            return errorMessages.map(({ key, message }, index) => (
              <div key={`${key}-${index}`}>
                <span style={{ fontWeight: "bold" }}><Icon name="times negative circle" />{key}:</span> {message}
              </div>
            ));
          })}
        </Message.Content>
      </Message>
    )
  );
};

FormSectionFeedback.propTypes = {
  errors: PropTypes.object.isRequired,
};

export default FormSectionFeedback;
