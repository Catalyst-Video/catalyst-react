# Catalyst Video Chat

This package is currently in development. If you experience issues, let us know on [GitHub](https://github.com/Catalyst-Video/catalyst-react/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)

📷💬 An open-source component that allows developers to quickly and easily add Zoom-like video chat to their web applications. Built using WebRTC, React, and Typescript. A functioning build be enabled in minutes with a few lines of code.

Check out the full [Catalyst documentation](https://docs.catalyst.chat/docs-intro)!

## Quick Start

#### Installation
Catalyst can be installed using either [`npm`](https://www.npmjs.com/package/catalyst-vc-react) or `yarn`

```
npm i catalyst-vc-react
```

#### Importation

```typescript
import CatalystChat from "catalyst-vc-react"
```
#### Implementation

```tsx
	<CatalystChat
			sessionKey="ENTER_SESSION_KEY_HERE"
			uniqueAppId="ENTER_UUID_HERE"
		/>
```
## Params

| Param        | Description                                                                                                 |  Type                             | Example Value                             | Required |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------- | -------- |
| `sessionKey` | Unique session identifier - peers with the same `sessionKey` are connected                                                                    |  `string` | `"UNDEFINED"` |  Yes      |
| `uniqueAppId` | Unique project identifier - keeps video calls from different projects from overlapping                                                          |  `string` | `"4d39df3f-f67b-4217-b832-57d4ffa2b217"` |  Yes      |
| `cstmServerAddress` | Domain for your signaling server. Uses the Catalyst Demo one by default                                                                   |  `string` | `"https://server.catalyst.chat/"` |  Optional    |
| `defaults`          | Settings for the default instance of Catalyst                                                                                   | ```{audioOn?: boolean; videoOn?: boolean; showChatArea?: boolean; showToastArea?: boolean; }```                              | ```{ audioOn: true, videoOn: true, showToastArea: true }```  | Optional      |
| `hidden`          | Hide any of Catalyst's wide array of video options                                                    | ```{ mute?: boolean; pausevideo?: boolean; screenshare?: boolean; fullscreen?: boolean; chat?: boolean; darkmode?: boolean; endcall?: boolean;  }```                              |```{ mute: false, pausevideo: false, screenshare: false, chat: false, darkmode: false, fullscreen: false, endcall: false }```  | Optional      |
| `picInPic`          | Enter Picture In Picture mode after clicking, double clicking, or not at all                   | ```string```                              |`click`, `dblclick`, `disabled`  | Optional      |
| `onStartCall`  | Function triggered when call is instantiated | `Function`  | `() => console.log("call started")` | Optional |
| `onAddPeer`  | Function triggered when a peer joins the call | `Function`  | `() => console.log("peer joined")` | Optional |
| `onRemovePeer`  | JSON string containing arbitrary data for your application | `string`  | `{ type: "arbitrary_data", meta: "foo", trigger: "bar" }` | Optional |
| `onEndCall`  | Function triggered when user clicks the "end call" button | `Function`  | `() => console.log("call ended")` | Optional |
| `arbitraryData`  | Stringified JSON passable through Catalyst if you need to transmit data between peers without involving an additional server | `string`  | `{ type: "arbitrary_data", meta: "foo" }` | Optional |
| `onReceiveArbitraryData`  | Function with a prop containing stringified arbitrary data triggered when a message with the type arbitrary_data is received. Can be used to send JSON between peers | `Function`  | `customFunction(arbitraryData)` | Optional |
| `cstmWelcomeMsg`  | Displays message in snackbar popup on session start. Set to "DISABLED" to hide it. | `Any element React can compile` or `string`                              | `Share your session key {sessionKey} with whoever wants to join `                                | Optional |
| `cstmOptionBtns`  | React elements that will be displayed in the Video Chat toolbar | `Array of anything React can compile` | `[<div className="ct-btn-container"><button className="ct-hover-btn ct-tooltip ct-not-selectable" onClick={() => console.log('do something')}><FontAwesomeIcon icon={faSync} /><span>Do Something</span></button></div>,]`                                | Optional |
| `themeColor`  | Alters Catalyst theme to use a particular color. Comes with a multitude of built-in options, or you can set a custom `hexadecimal` color of your choice. | `string`  | `blue` | Optional |
| `showDotColors`  | Displays a small dot-shaped color indicator based on the user's UUID to help identify who sent a particular chat in large group calls | `boolean`  | `false` | Optional |
| `showBorderColors`  | Displays a border around every user's video in a call based on their UUID to help identify who sent a particular chat in large group calls | `boolean`  | `false` | Optional |
| `autoFade`  | Enable or disable header logo and toolbar from fading after X milliseconds of inactivity. If 0, disabled | `number`  | `600` | Optional |
| `alwaysBanner`  | Always display "Powered By Catalyst" banner instead of Logo responsively | `boolean`  | `false` | Optional |
| `darkMode`  | Switch theming to dark mode | `boolean`  | `false` | Optional |


## Meta

Created by [@GoldinGuy](https://github.com/GoldinGuy) and [@JoeSemrai](https://github.com/JosephSemrai)

Distributed under the AGPL-3.0-only license. See [LICENSE](https://github.com/Catalyst-Video/catalyst-react/blob/master/LICENSE) for more information.