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
| `hiddenTools`          | Hide any of Catalyst's wide array of video options                                                    | ```{ muteaudio?: boolean; pausevideo?: boolean; screenshare?: boolean; fullscreen?: boolean; chat?: boolean; darkmode?: boolean; endcall?: boolean;  }```                              |```{ muteaudio: true, pausevideo: true, screenshare: true, chat: true, darkmode: true, fullscreen: true, endcall: true }```  | Optional      |
| `name`  | Name of user joining call. This will be reflected on their video stream as well as in chat | `string`  | `() => console.log("call started")` | Optional |
| `onStartCall`  | Function triggered when call is instantiated | `Function`  | `() => console.log("call started")` | Optional |
| `onAddPeer`  | Function triggered when a peer joins the call | `Function`  | `() => console.log("peer joined")` | Optional |
| `onRemovePeer`  | JSON string containing arbitrary data for your application | `string`  | `{ type: "arbitrary_data", meta: "foo", trigger: "bar" }` | Optional |
| `onEndCall`  | Function triggered when user clicks the "end call" button | `Function`  | `() => console.log("call ended")` | Optional |
| `onSubmitLog`  | Function triggered when session ends, either by the user clicking the "end call" button or exiting the tab. This is also triggered by refreshing. The log is stringified JSON containing the following information: timestamp, session id, session length, and session size. | `Function`  | `(log: string) => console.log(log)` | Optional |
| `arbitraryData`  | Stringified JSON passable through Catalyst if you need to transmit data between peers without involving an additional server | `string`  | `{ type: "arbitrary_data", meta: "foo" }` | Optional |
| `onReceiveArbitraryData`  | Function with a prop containing stringified arbitrary data triggered when a message with the type arbitrary_data is received. Can be used to send JSON between peers | `Function`  | `customFunction(arbitraryData)` | Optional |
| `themeColor`  | Alters Catalyst theme to use a particular color. Comes with a multitude of built-in options, or you can set a custom `hexadecimal` color of your choice. | `string`  | `blue` | Optional |
| `darkModeDefault`  | Switch theming to dark mode | `boolean`  | `false` | Optional |
| `picInPic`          | Enter Picture In Picture mode after clicking, double clicking, or not at all                   | ```string```                              |`click`, `dblclick`, `disabled`  | Optional      |
| `autoFade`  | Enable or disable header logo and toolbar from fading after X milliseconds of inactivity. If 0, disabled | `number`  | `600` | Optional |
| `alwaysBanner`  | Always display "Powered By Catalyst" banner instead of Logo responsively | `boolean`  | `false` | Optional |
| `disableSetupRoom`  | Disable view where user will be prompted to select their input device preferences and test their video/audio before joining the call. | `boolean`  | `false` | Optional |
| `disableLocalVidDrag`  | Disable the ability to drag local video. Useful for implementations where the entire chat is draggable | `boolean`  | `true` | Optional |
| `cstmBackground`  | Change the background color of setup room, loading screen, unsupported screen, and permissions page. Can be either a hexadecimal color or a css gradient. | `string`  | `true` | Optional |
| `disableRedIndicators`  | Use themecolor instead of red for important indicators like mute, pause video, or end call. | `boolean`  | `false` | Optional |
| `fourThreeAspectRatioEnabled`  | Use 4:3 aspect ratio instead of default 16:9 for video chat. | `boolean`  | `false` | Optional |
| `cstmWelcomeMsg`  | Displays message in snackbar popup on session start. Set to `"DISABLED"` to hide it. | `Any element React can compile` or `string`                              | `Share your session key {sessionKey} with whoever wants to join `                                | Optional |
| `cstmOptionBtns`  | React elements that will be displayed in the Video Chat toolbar | `{ id: string; tooltip: string; onClick: Function: fontAwesomeIcon: [IconPrefix, IconName]; }` | `[{ id: 'test', tooltip: 'Terms of Service', onClick: () => { console.log("cstm") }, fontAwesomeIcon: ['fas', 'info-circle'], }, ]` | Optional |


## Meta

Created by [@GoldinGuy](https://github.com/GoldinGuy) and [@JoeSemrai](https://github.com/JosephSemrai)

Distributed under the AGPL-3.0-only license. See [LICENSE](https://github.com/Catalyst-Video/catalyst-react/blob/master/LICENSE) for more information.