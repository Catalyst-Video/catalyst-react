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
import { VideoChat } from "catalyst-vc-react"
```
#### Implementation

```tsx
	<VideoChat
			sessionKey="ENTER_SESSION_KEY_HERE"
			uniqueAppId="ENTER_UUID_HERE"
		/>
```
## Params

| Param        | Description                                                                                                 |  Type                             | Example Value                             | Required |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------- | -------- |
| `sessionKey` | Unique session identifier - peers with the same `sessionKey` are connected                                                                    |  `string` | `"UNDEFINED"` |  Yes      |
| `uniqueAppId` | Unique project identifier - keeps video calls from different projects from overlapping                                                          |  `string` | `"4d39df3f-f67b-4217-b832-57d4ffa2b217"` |  Yes      |
| `cstmServerAddress` | Domain for your signaling server. Uses the Catalyst Demo one by default                                                                   |  `string` | `"https://catalyst-video-server.herokuapp.com/"` |  Optional    |
| `defaults`          | Settings for the default instance of Catalyst                                                                                   | ```{audioOn?: boolean; videoOn?: boolean; showChatArea?: boolean; showCaptionsArea?: boolean; }```                              | ```{ audioOn: true, videoOn: true, showCaptionsArea: true,  showCaptionsArea: true }```  | Optional      |
| `hidden`          | Hide any of Catalyst's wide array of video options                                                    | ```{ mute?: boolean; pausevideo?: boolean; screenshare?: boolean; chat?: boolean; captions?: boolean; endcall?: boolean; }```                              |```{ mute: false, pausevideo: false, screenshare: false, chat: false, captions: false, endcall: false }```  | Optional      |
| `picInPic`          | Enter Picture In Picture mode after clicking, double clicking, or not at all                   | ```string```                              |`click`, `dblclick`, `disabled`  | Optional      |
| `onStartCall`  | Function triggered when call is instantiated | `Function`  | `() => console.log("call started")` | Optional |
| `onAddPeer`  | Function triggered when a peer joins the call | `Function`  | `() => console.log("peer joined")` | Optional |
| `onRemovePeer`  | Function triggered when a peer leaves the call | `Function`  | `() => console.log("peer left")` | Optional |
| `onEndCall`  | Function triggered when user clicks the "end call" button | `Function`  | `() => console.log("call ended")` | Optional |
| `cstmSnackbarMsg`  | Displays message in snackbar popup on session start | `HTMLElement` or `Element` or `string`                              | `Share your session key {sessionKey} with whoever wants to join `                                | Optional |
| `cstmOptionBtns`  | React elements that will be displayed in the Video Chat toolbar | `Element[]` | `[<div className="ct-btn-container"><button className="ct-hover-btn ct-tooltip ct-not-selectable" onClick={() => console.log('do something')}><FontAwesomeIcon icon={faSync} /><span>Do Something</span></button></div>,]`                                | Optional |
| `themeColor`  | Alters Catalyst theme to use a particular color. Comes with a multitude of built-in options, or you can set a custom `hexadecimal` color of your choice. | `string`  | `blue` | Optional |


## Meta

Created by [@GoldinGuy](https://github.com/GoldinGuy) and [@JoeSemrai](https://github.com/JosephSemrai)

Distributed under the GNU AGP3 license. See [LICENSE](https://github.com/Catalyst-Video/catalyst-react/blob/master/LICENSE) for more information.
