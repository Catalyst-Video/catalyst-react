# Catalyst Video Chat

📷💬 Reliable and scalable open-source video chat in a few lines of code.

Check out the full [Catalyst documentation](https://docs.catalyst.chat/docs-getting-started)!

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
			room="ROOM_NAME"
			appId="YOUR_CATALYST_PROJECT_ID"
			name="MEMBER_NAME"
			onEndCall={() => console.log('Call ended!')}
		/>
```

You will need a Catalyst `appId` API key to connect to our servers. This can be obtained in under a minute by visiting the *API keys* tab of our [management portal](https://manage.catalyst.chat/). 

Our servers are free for your first 30 monthly active users, which means they should not cost you anything in development (and possibly production)!

We recommend a minimum parent container size of 400px X 450px.

## Parameters

| Prop        | Description                                                                                                 |  Type                             | Example Value                             | Required |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------- | -------- |
| `room` | Unique session identifier _(peers with the same `room` are connected)_                                                                    |  `string` | `ROOM_NAME` |  Required      |
| `appId` | Unique project identifier, obtained from the *API keys* tab of our [management portal](https://manage.catalyst.chat/)                                                   |  `string` | `YOUR_CATALYST_PROJECT_ID` |  Required  |
| `name` | Display name of member joining the call |  `string` | `MEMBER_NAME` |  Optional |
| `fade` | Milliseconds of no user interaction before fading out controls. Disabled when set to `0`                   |  `number` | `600` | Optional |
| `audioOnDefault` |Is microphone enabled by default                        |  `boolean` | `true` | Optional |
| `videoOnDefault` | Is webcam enabled by default               |  `boolean` | `true` | Optional |
| `theme` | Color scheme. Includes: **primary** _(main color)_, **secondary** _(background color)_, **tertiary** _(button color)_, **quaternary** _(button hover color)_, **quinary** _(text color)_            |  `string` | `{ primary?: string; secondary?: string; tertiary?: string; quaternary?: string; quinary?: string; }` | `default` | Optional |
| `simulcast` | Publish multiple levels of quality for video streams              |  `boolean` | `true` | Optional |
| `bgRemoval` | Set video background removal options, including blur or custom background image path |  `string` | `blur`, `https://img.png` | Optional |
| `disableChat` | Hide text chat functionality              |  `boolean` | `true` | Optional |
| `disableSelfieMode` | Stop auto-correction of uncanny-valley effect that flips portrait camera |  `boolean` | `true` | Optional |
| `disableSetupView` | Skip setup view       |  `boolean` | `true` | Optional |
| `disableNameField` | Hide user name input field in setup view     |  `boolean` | `true` | Optional |
| `cstmSetupBg` | Gradient or hex-code background for setup view      |  `string` | `#fff` | Optional |
| `disableRefreshBtn` | Hide refresh button in top settings bar |  `boolean` | `true` | Optional |
| `cstmWelcomeMsg` | Message displayed when you are the only member in room      |  `string`, `HTMLElement` | `Welcome!` | Optional |
| `cstmSupportUrl` | Url for all help/support messages. When set to an empty string hides support icon.   |  `string` | `https://catalyst.chat/contact.html` | Optional |
| `arbData` | Data passed to all other members of room  |  `Uint8Array` | `TextEncoder().encode('str')` | Optional |
| `handleReceiveArbData` | Function triggered whenever arbitrary data is received    |  `Function` | `(arbData: Uint8Array) => void` | Optional |
| `handleUserData` | Function passed all user metadata after token is generated    |  `Function` | `(userData: CatalystUserData) => void` | Optional |
| `onJoinCall` | Function triggered when user joins the call  |  `Function` | `() => void` | Optional |
| `onMemberJoin` | Function triggered when a member joins the call     |  `Function` | `() => void` | Optional |
| `onMemberLeave` | Function triggered when a member leaves the call       |  `Function` | `() => void` | Optional |
| `onLeaveCall` | Function triggered when user leaves call       |  `Function` | `() => void` | Optional |

## Meta

Created by [@GoldinGuy](https://github.com/GoldinGuy) and [@JoeSemrai](https://github.com/JosephSemrai)

The master branch of this repository contains Catalyst V3, the [latest version](https://www.npmjs.com/package/catalyst-vc-react). The older V2 version can be found on the [Catalyst V2 Branch](https://github.com/Catalyst-Video/catalyst-react/tree/CatalystV2). 

Catalyst is designed with safety and security in mind. Visit our [terms of service and privacy policy](https://catalyst.chat/tos.html) to learn more.

Catalyst V3 is based on a custom version of [WebRTC SFU](https://github.com/pion/ion-sfu) [LiveKit](https://github.com/Catalyst-Video/catalyst-client) infrastructure to allow for more stability and scalability. Prior versions of Catalyst made use of direct P2P protocols.

Distributed under the AGPL-3.0-only license. See [LICENSE](https://github.com/Catalyst-Video/catalyst-react/blob/master/LICENSE) for more information.

Catalyst Scientific is an LLC in the state of Florida. All rights reserved.
<!-- ngrok http 1234 -host-header=”localhost:1234"  -->