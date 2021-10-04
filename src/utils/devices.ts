export async function initOutputDevice(
         outDeviceId: string,
         setOutputDevice: (device: MediaDeviceInfo) => void,
         setOutDId: (deviceId: string) => void
       ): Promise<void> {
         const devices = await navigator.mediaDevices.enumerateDevices();
         const outputDevices = devices.filter(
           id => id.kind === 'audiooutput' && id?.deviceId
         );
         let outDevice: MediaDeviceInfo | undefined;
         if (outDeviceId) {
           outDevice = outputDevices.find(d => d?.deviceId === outDeviceId);
         }
         if (!outDevice) {
           outDevice = outputDevices[0];
         }
         setOutputDevice(outDevice);
         if (outDeviceId !== outDevice?.deviceId && outDevice?.deviceId) {
           setOutDId(outDevice?.deviceId);
         }
       }