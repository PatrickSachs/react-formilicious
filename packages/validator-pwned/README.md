# Have I Been Pwned? ![npm](https://img.shields.io/npm/v/@react-formilicious/validator-pwned.svg)

A field validator for [https://github.com/PatrickSachs/react-formilicious/](react-formilicious) based on the [https://haveibeenpwned.com/](haveibeenpwned.com) database.

See the storybook for documentation and all available components here: https://patricksachs.github.io/react-formilicious/validator-pwned/

```jsx
import pwned from "@react-formilicious/validator-pwned";

<Form
  data={{
    password: "test123"
  }}
  elements={[
    {
      type: TextField,
      mode: "password",
      key: "password",
      name: "🔑 Password",
      placeholder: "🔑 Your super secret password here!",
      validator: pwned() // Simply add this as a validator, and you are good to go!
    }
  ]}/>
```

![](https://patrick-sachs.de/content/react-formilicious/wiki/validator5.gif)
