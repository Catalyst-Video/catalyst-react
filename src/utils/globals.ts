/*  Catalyst Scientific Video Chat Component File
Copyright (C) 2021 Catalyst Scientific LLC, Seth Goldin & Joseph Semrai

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version. 

While this code is open-source, you may not use your own version of this
program commerically for free (whether as a business or attempting to sell a variation
of Catalyst for a profit). If you are interested in using Catalyst in an 
enterprise setting, please either visit our website at https://catalyst.chat 
or contact us for more information.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

You can contact us for more details at support@catalyst.chat. */

export const DEFAULT_SERVER_ADDRESS = 'https://api.catalyst.chat/';
export const AUTH_ADDRESS = 'https://staging.catalyst.chat/auth/meeting/token';
export const DEFAULT_AUTOFADE = 600;
export const SUPPORT_EMAIL = 'support@catalyst.chat';
export const SUPPORT_URL = 'https://catalyst.chat/contact';
export const DEFAULT_WELCOME_MESSAGE = '👋 Waiting for others to join...';
export const THEMES = {
         // TODO: Add more themes, complete existing ones
         default: {
           primary: '#11c1e8',
           secondary: '#374151',
           tertiary: '#4B5563',
           quaternary: '#6B7280',
           quinary: '#fff',
         },
         light: {
           primary: '#11c1e8',
           secondary: '#d4def7',
           tertiary: '#b4bdc0',
           quaternary: '#6B7280',
           quinary: '#fff',
         },
         dark: {
           primary: '#11c1e8',
           secondary: '#111827',
           tertiary: '#374151',
           quaternary: '#4B5563',
           quinary: '#fff',
         },
         night: {
           primary: '#c471ed',
           secondary: '#000',
           tertiary: '#1F2937',
           quaternary: '#374151',
           quinary: '#fff',
         },
         hoursLight: {
           primary: '#50c878',
           secondary: '#e1e2ea', //'#e5e7eb',
           tertiary: '#b4bdc0', // D1D5DB
           quaternary: '#6B7280',
           quinary: '#fff',
         },
         hoursDark: {
           primary: '#50c878',
           secondary: '#17171d',
           tertiary: '#252429',
           quaternary: '#45a566',
           quinary: '#fff',
         },
       };
export const BUILT_IN_BACKGROUNDS = [
          'https://user-images.githubusercontent.com/47064842/134439146-4df72e66-6f56-4bcd-8ac3-d71fae56e755.png',
          'https://user-images.githubusercontent.com/47064842/134443664-e46ee13f-eda7-4a85-942a-30e39eb2748c.png',
          'https://user-images.githubusercontent.com/47064842/134443692-c09b982c-5009-4312-9745-3ed07af769a8.png',
          'https://user-images.githubusercontent.com/47064842/134443673-c1858afb-1263-4ea6-822e-b84658ce726f.png',
          'https://user-images.githubusercontent.com/47064842/134443701-6f97b098-c6ba-4261-93f1-83188783a044.png',
          'https://user-images.githubusercontent.com/47064842/134443845-ea83f32d-5833-4f3f-8002-5507bc4b03ae.jpg',
          'https://user-images.githubusercontent.com/47064842/134443897-2f1c7b4f-32dd-46cd-9104-cf41f4d623a0.jpg',
       ];