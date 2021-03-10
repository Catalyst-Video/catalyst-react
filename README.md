# Catalyst Video Chat React Component

📷💬 An open-source React component that allows developers to quickly and easily add Zoom-like video chat to their web applications. Built using WebRTC, using Typescript. A functioning build be enabled in minutes with as few as five lines of code.
## Functionality & Params


| Param        | Description                                                                                                 | Sample Type                             | Default Value                             | Required |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------- | -------- |
| `sessionKey` | Unique session identifier - peers with the same `sessionKey` are connected                                                                    |  `string` | `"UNDEFINED"` |  Yes      |
| `defaultSettings`          | Settings for the default instance of Catalyst                                                                                   | ```{ hideChat?: boolean; audioOn?: boolean; videoOn?: boolean; hideCaptions?: boolean; hideLogo?: boolean; }```                              | ```{ hideChat: true, audioOn: true, videoOn: true, hideCaptions: true, hideLogo: false }```  | Optional      |
| `customSnackbarMsg`  | Displays message in snackbar popup on session start | `HTMLElement` or `Element` or `string`                              | `Share your session key {sessionKey} with whoever wants to join `                                | Optional |
| `themeColor`  | Alters Catalyst theme to use a particular color. Comes with a multitude of built-in options, or you can set a custom `hexadecimal` color of your choice. | `string`  | `blue` | Optional |

## Usage

### Installation

Install this package in any of your projects by running 
```
npm install catalyst-vc-react
```
or 
```
yarn install catalyst-vc-react
```

### Importing

```typescript
import { VideoChat } from "catalyst-vc-react"
```

If you want to access the utils or interfaces within the package, use

```typescript
import { VCDataInterface } from "catalyst-vc-react/interfaces"

import { Utils } from "catalyst-vc-react/utils";
```

### Implementation

```tsx
	<VideoChat
			sessionKey={"testKey"}
			defaultSettings={{
				hideChat: true,
				audioOn: true,
				videoOn: true,
				hideCaptions: true,
				hideLogo: false
			}}
		/>
```

Above is a simplistic example of a `VideoChat` component being embedded in a project. The rooms are paired by the `sessionKey` attribute: two users looking at a version of this component with the same sessionKey will enter a video chat session.

This will use Catalyst's demo signaling server by default, allowing you to see a functioning version of video chat in your projects immediately. This server has the following usage quotas:
```
<Insert Quotas here>
```
You can create your own server by following the Catalyst server setup docs [here](https://linktoserversetupdocs)

### Theming

You can change the color scheme of Catalyst to your tastes by using the `themeColor` and `styles` optional params. The possible built-in options are the [following](https://coolors.co/d53f8c-e53e3e-dd6b20-ffce26-38a169-319795-3182ce-5a67d8-805ad5):

![image](https://user-images.githubusercontent.com/47064842/110560201-90490b80-8113-11eb-9305-85f11cd15c0d.png)
- [pink](https://coolors.co/D53F8C)
- [red](https://coolors.co/E53E3E)
- [orange](https://coolors.co/DD6B20)
- [yellow](https://coolors.co/FFCE26)
- [green](https://coolors.co/38A169)
- [teal](https://coolors.co/319795)
- [blue](https://coolors.co/3182CE)
- [indigo](https://coolors.co/5A67D8)
- [purple](https://coolors.co/805AD5)

They can be used in the format `themeColor={"blue"}`. You can also set any `hexidecimal` color by simply passing it in the format `#ColorCode`. For example, `#456789`.
### Examples

```typescript
<Further examples of component in use>
```

Catalyst can be seen in action in the following active projects:
-  [ReadTogether](https://github.com/GoldinGuy/ReadTogether)
-  [Example 2](https://github.com/GoldinGuy/Ex2)
-  [Example 3](https://github.com/GoldinGuy/Ex3)
## Contributing

1. Fork Catalyst-React [here](https://github.com/Catalyst-Video/catalyst-react/fork)
2. Create a feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request


### Development setup

After you have the repo on your local machine, run the following commands to install deps

```
npm install
```

Once you have everything installed and updated, run the following command to compile a demo version to localhost

```
yarn start
```
## Meta

Created by [@GoldinGuy](https://github.com/GoldinGuy) and [@JoeSemrai](https://github.com/JosephSemrai)

Distributed under the MIT license. See [LICENSE](https://github.com/Catalyst-Video/catalyst-react/blob/master/LICENSE) for more information.
