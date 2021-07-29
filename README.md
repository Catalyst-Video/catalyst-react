# Catalyst Video Chat

📷💬 Reliable and scalable open-source video chat in a few lines of code.

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
			room="ROOM_NAME"
			appId="YOUR_CATALYST_PROJECT_ID"
			name="MEMBER_NAME"
			onEndCall={() => console.log('Call ended!')}
		/>
```

You will need a Catalyst `appId` API key to connect to our servers. This can be obtained in under a minute by visiting the *API keys* tab of our [management portal](https://manage.catalyst.chat/). 

Our servers are free for your first 30 monthly active users, which means they should not cost you anything in development (and possibly production)!

## Parameters

| Prop        | Description                                                                                                 |  Type                             | Example Value                             | Required |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------- | -------- |
| `room` | Unique session identifier _(peers with the same `room` are connected)_                                                                    |  `string` | `ROOM_NAME` |  Required      |
| `appId` | Unique project identifier, obtained from the *API keys* tab of our [management portal](https://manage.catalyst.chat/)                                                   |  `string` | `YOUR_CATALYST_PROJECT_ID` |  Required  |
| `name` | Display name of participant joining the call |  `string` | `MEMBER_NAME` |  Optional |
| `dark` | Is dark mode enabled by default                                                    |  `boolean` | `false` | Optional |
| `fade` | Milliseconds of no user interaction before fading out controls. Disabled when set to `0`                   |  `number` | `600` | Optional |
| `audioOnDefault` |Is microphone enabled by default                        |  `boolean` | `true` | Optional |
| `videoOnDefault` | Is webcam enabled by default               |  `boolean` | `true` | Optional |
| `theme` | Color scheme. Includes: **primary** _(main color)_, **secondary** _(background color)_, **tertiary** _(button color)_, **quaternary** _(button hover color)_              |  `string` | `{ primary?: string; secondary?: string; tertiary?: string; quaternary?: string; }` | `light` | Optional |
| `simulcast` | Publish multiple levels of quality for video streams              |  `boolean` | `true` | Optional |
| `disableChat` | Hide text chat functionality              |  `boolean` | `true` | Optional |
| `disableSetupRoom` | Skip setup view       |  `boolean` | `true` | Optional |
| `disableNameField` | Hide user name input field in setup view     |  `boolean` | `true` | Optional |
| `cstmSetupBg` | Gradient or hex-code background for setup view      |  `string` | `#fff` | Optional |
| `arbData` | Data passed to all other members of room  |  `Uint8Array` | `TextEncoder().encode('str')` | Optional |
| `handleReceiveArbData` | Function triggered whenever arbitrary data is received    |  `Function` | `(arbData: Uint8Array) => void` | Optional |
| `onJoinCall` | Function triggered when user joins the call  |  `Function` | `() => void` | Optional |
| `onMemberJoin` | Function triggered when a member joins the call     |  `Function` | `() => void` | Optional |
| `onMemberLeave` | Function triggered when a member leaves the call       |  `Function` | `() => void` | Optional |
| `onLeaveCall` | Function triggered when user leaves call       |  `Function` | `() => void` | Optional |

## Meta

Created by [@GoldinGuy](https://github.com/GoldinGuy) and [@JoeSemrai](https://github.com/JosephSemrai)

Designed with safety and security in mind. Visit our [terms of service and privacy policy](https://catalyst.chat/tos.html) to learn more.

Distributed under the AGPL-3.0-only license. See [LICENSE](https://github.com/Catalyst-Video/catalyst-react/blob/master/LICENSE) for more information.