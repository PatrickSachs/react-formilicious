import * as React from "react";
import find from "./helpers/find";
import makePromise, { thenCatch } from "./helpers/makePromise";
import { sanitizeValidationResult, sanitizeOnSubmitResult } from "./validators";

export default class Form extends React.Component {
  constructor() {
    super();
    this.mounted = true;
    this.state = {
      waiting: false,
      formValidationResult: null,
      fields: {},
      initialData: {}
    };
    this.renderElement = this.renderElement.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.onSubmit = this.onSubmitButtonClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmitButtonClick = this.onSubmitButtonClick.bind(this);
    this.onResetButtonClick = this.onResetButtonClick.bind(this);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  static getDerivedStateFromProps(newProps, oldState) {
    // todo: let the field clases provide default values in case a data entry is undefined
    return {
      ...oldState,
      initialData: newProps.data
    };
  }

  getSystemProps() {
    const { initialData, fields, waiting } = this.state;
    return {
      initialData, fields, waiting
    };
  }

  getFieldProps(key) {
    const field = this.state.fields[key];
    return {
      ...field,
      key,
      initialValue: this.state.initialData[key]
    };
  }

  getElement(key) {
    return this.props.elements.find(element => element.key === key);
  }

  getFlatDataStructure() {
    const { elements } = this.props;
    const { initialData, fields } = this.state;
    return elements.reduce((acc, element) => {
      const field = fields[element.key];
      return { ...acc, [element.key]: field ? field.value : initialData[element.key] };
    }, {});
  }

  onChange() {
    const { onChange } = this.props;
    if (onChange) {
      onChange(this.getFlatDataStructure());
    }
  }

  onChangeField(key, value) { // todo: allow fields to return validation errors/hints/etc...
    const element = this.getElement(key);
    if (!element.validator) {
      this.setState(s => ({
        fields: { ...s.fields, [key]: { validated: "ok", message: null, value } }
      }), this.onChange);
    } else {
      this.setState(s => ({
        fields: { ...s.fields, [key]: { validated: "pending", message: null, value } }
      }), () => {
        this.runFieldValidator(element, value)
          .then(res => this.mounted && this.setState(s => (s.fields[key].validated === "pending" ? {
            fields: {
              ...s.fields, [key]: {
                validated: res.validated,
                message: res.message,
                value
              }
            }
          } : null)), this.onChange);
      });
    }
  }

  runFieldValidator(element, value) {
    return thenCatch(makePromise(() => element.validator(value, this.getSystemProps())), sanitizeValidationResult);
  }

  onResetButtonClick(e) {
    e.preventDefault();
    this.setState({ fields: {}, formValidationResult: null });
  }

  onSubmitButtonClick(e) {
    e.preventDefault();
    // todo: validate all fields(or just the non validated) one shere. Primary difficulty is here is "pending"!
    // todo: add a prop to validate the initial values.
    const { fields } = this.state;
    const invalidField = find(fields, field => field.validated === "error" || field.validated === "pending");
    if (invalidField) {
      console.warn("[react-formilicious] Form submit error!", { fields, invalidField });
    } else {
      const { onSubmit } = this.props;
      this.setState({ formValidationResult: null, waiting: true }, () => {
        const data = this.getFlatDataStructure();
        console.log("[react-formilicious] Form submit!", { data });
        thenCatch(makePromise(() => onSubmit(data)), onSubmitResult => this.mounted && this.setState(s => {
          const { key, ...result } = sanitizeOnSubmitResult(onSubmitResult);
          if (!key || !this.getElement(key)) {
            return { waiting: false, formValidationResult: result };
          } else {
            return { waiting: false, fields: { ...s.fields, [key]: result } };
          }
        }));
      });
    }
  }

  render() {
    return this.renderForm();
  }

  renderForm() {
    return (<form>
      {this.renderElements()}
      {this.renderButtons()}
    </form>);
  }

  renderButtons() {
    let { buttons } = this.props;
    if (!buttons) {
      buttons = [
        {
          key: "submit",
          name: "✅ Submit",
          action: "submit"
        },
        {
          key: "reset",
          name: "️❎ Reset",
          action: "reset"
        }
      ];
    };
    return buttons.map(this.renderButton);
  }

  renderButton({ key, name, action }) {
    switch (action) {
      case "submit": action = this.onSubmitButtonClick; break;
      case "reset": action = this.onResetButtonClick; break;
      default: action = action; break;
    }
    const { waiting } = this.state;
    // todo: make this rendering logic adjustable
    return (<a key={key} disabled={waiting} className={"button" + (waiting ? " is-loading" : "")} onClick={action}>
      {name}
    </a>);
  }

  renderElements() {
    const { elements } = this.props;
    return elements.map(this.renderElement);
  }

  renderElement({ type: FieldType, key, ...element }) {
    return (<FieldType
      {...element}
      key={key}
      system={this.getSystemProps()}
      field={this.getFieldProps(key)}
      onChange={newValue => this.onChangeField(key, newValue)} />);
  }
}