import React, { useEffect, useState } from 'react';
import { logger } from '../utils/general';

const DeviceSelector = ({
  device,
  setDevice,
  type,
  defaultText,
}: {
  device?: MediaDeviceInfo;
  setDevice: Function;
  type: string;
  defaultText: string;
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>();

  useEffect(() => {
    setMediaDevices();
  }, []);

  const setMediaDevices = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
      return;
    navigator.mediaDevices
      .enumerateDevices()
      .then(devs => {
        let typedDevs: MediaDeviceInfo[] = [];
        devs.forEach(device => {
          if (device.kind.toString() === type) typedDevs.push(device);
        });
        setDevices(typedDevs);
      })
      .catch(err => {
        logger(err.name + ': ' + err.message);
      });
  };

  return (
    <div id="opt" className="group inline-block my-1">
      <button className="outline-none focus:outline-none px-3 bg-white dark:bg-gray-800 rounded-sm flex items-center min-w-32">
        <span
          className="pr-1 text-base flex-1 truncate dark:text-white"
          style={{ maxWidth: '7rem' }}
        >
          {device?.label.substring(0, device.label.indexOf(' (')) ??
            defaultText}
        </span>
        <span>
          <svg
            className="fill-current dark:text-white h-4 w-4 transform group-hover:-rotate-180
        transition duration-150 ease-in-out"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </span>
      </button>

      <ul
        className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-sm transform scale-0 group-hover:scale-100 absolute 
  transition duration-150 ease-in-out origin-top min-w-32 cursor-pointer"
      >
        {devices?.map(dev => {
          return (
            <li
              onClick={() => setDevice(dev)}
              key={dev.label}
              className="rounded-sm px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer dark:text-white"
            >
              {dev.label.substring(0, dev.label.indexOf(' ('))}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default DeviceSelector;
