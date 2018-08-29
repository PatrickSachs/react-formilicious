import * as React from 'react';

import Form from '../../../src';
import TagList from '../../../src/fields/TagList';
import DemoBaseForm from ".";

class TagListForm extends DemoBaseForm {
  render() {
    return (<Form
      data={{
        hashtags: ["#partyhard"]
      }}
      onSubmit={this.onSubmit}
      elements={[
        {
          type: TagList,
          key: "hashtags",
          tags: ["#inthistogether", "#drinkresponsibly", "lamehashtag"],
          allowCustomTags: true,
          name: "🎉 Enter awesome party hashtags",
          validator: hashtags => hashtags.find(hashtag => hashtag[0] !== "#") && "Boo! Hashtags must start with #!" 
        }
      ]} />);
  }
}

export const title = "TagList Test Form";
export const subtitle = "TagLists 🎉";
export default TagListForm;
