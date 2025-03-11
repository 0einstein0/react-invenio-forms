// This file is part of React-Invenio-Forms
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
// React-Invenio-Forms is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component, useState } from "react";
import PropTypes from "prop-types";
import { Field, FastField } from "formik";
import { Accordion, Container, Icon, Label } from "semantic-ui-react";
import _omit from "lodash/omit";
import _get from "lodash/get";
import { flattenAndCategorizeErrors } from "../utils";

export class AccordionField extends Component {
  hasError = (errors, initialValues = undefined, values = undefined) => {
    const { includesPaths } = this.props;
    for (const errorPath in errors) {
      for (const subPath in errors[errorPath]) {
        const path = `${errorPath}.${subPath}`;
        if (
          _get(initialValues, path, "") === _get(values, path, "") &&
          includesPaths.includes(path)
        ) {
          return true;
        }
      }
    }
    return false;
  };
  
  countErrorsAndSeverity = (errors, includePaths) => {
  // Flatten and categorize errors
  const { flattenedErrors, severityChecks } = flattenAndCategorizeErrors(errors);
  
  // Initialize the count object
  const count = {};

  // Count matching paths from flattenedErrors based on includePaths
  for (const path in flattenedErrors) {
    if (includePaths.some((includePath) => path.startsWith(includePath))) {
      count['errors'] = (count['errors'] || 0) + 1;
    }
  }

  // Count severity from severityChecks based on includePaths
  for (const key in severityChecks) {
    const severity = severityChecks[key].severity;
    const path = key;  

    if (severity && includePaths.some((includePath) => path.startsWith(includePath))) {
      count[severity] = (count[severity] || 0) + 1;
    }
  }

  return count;
};
  

renderAccordion = (props) => {
  const {
    form: { errors, status, initialErrors, initialValues, values },
  } = props;
  const { includesPaths, label, children, active } = this.props;

  const uiProps = _omit(this.props, ["optimized", "includesPaths"]);
  const hasError =
    this.hasError(errors, initialValues, values) || this.hasError(initialErrors);

  const errorCount = this.countErrorsAndSeverity(errors, includesPaths) || this.countErrorsAndSeverity(initialErrors, includesPaths);
  
  const errorClass = hasError ? "error secondary" : "";
  const [activeIndex, setActiveIndex] = useState(active ? 0 : -1);

  const handleTitleClick = (e, { index }) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  return (
    <Accordion
      inverted
      className={`invenio-accordion-field ${errorClass}`}
      {...uiProps}
    >
      <Accordion.Title
        active={activeIndex === 0}
        index={0}
        onClick={handleTitleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleTitleClick(e, { index: 0 });
          }
        }}
        tabIndex={0}
      >
        {label}

        {Object.keys(errorCount).map((severity) => {
          if (severity === "errors" && errorCount[severity] > 0) {
            return (
              <Label
                key={severity}
                size="tiny"
                circular
                negative
                className="accordion-label error"
              >
                {errorCount[severity]} {errorCount[severity] === 1 ? "error" : "errors"}
              </Label>
            );
          }

          if (severity !== "errors" && errorCount[severity] > 0) {
            return (
              <Label
                key={severity}
                size="tiny"
                circular
                className={`accordion-label ${severity}`} // Dynamically assign the class based on severity
              >
                {errorCount[severity]} {errorCount[severity] === 1 ? severity : `${severity}s`}
              </Label>
            );
          }

          return null;
        })}

        <Icon name={activeIndex === 0 ? "angle down" : "angle right"} />
      </Accordion.Title>

      <Accordion.Content active={activeIndex === 0}>
        <Container>{children}</Container>
      </Accordion.Content>
    </Accordion>
  );
};


  render() {
    const { optimized } = this.props;
    const FormikField = optimized ? FastField : Field;
    return <FormikField name="" component={this.renderAccordion} />;
  }
}

AccordionField.propTypes = {
  active: PropTypes.bool,
  includesPaths: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  optimized: PropTypes.bool,
  children: PropTypes.node,
  ui: PropTypes.object,
};

AccordionField.defaultProps = {
  active: true,
  includesPaths: [],
  label: "",
  optimized: false,
  children: null,
  ui: null,
};
