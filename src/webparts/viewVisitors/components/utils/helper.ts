import moment from 'moment';

/**
 * Get URL parameter by name
 * @param name Parameter name
 * @returns Parameter value
 */
export function getUrlParameter(name: string): string {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * Set cookie
 * @param cname Cookie name
 * @param cvalue Cookie value
 * @param exdays Expiration days
 */
export function setCookie(cname: string, cvalue: string, exdays: number): void {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Get cookie
 * @param cname Cookie name
 * @returns Cookie value
 */
export function getCookie(cname: string): string {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/**
 * Format date for display
 * @param value Value object
 * @param renderType Render type ('row' or 'group')
 * @param field Field name
 * @param format Date format
 * @returns Formatted date string
 */
export function customDateRender(value: any, renderType: string, field: string, format: string): string {
  let dt = null;

  if (renderType === 'row') {
    if (moment(value[field]).isValid()) {
      dt = moment(value[field]).format(format);
    }
    return dt;
  }
  if (renderType === 'group') {
    if (moment(value).isValid()) {
      dt = moment(value).format(format);
    }
    return dt;
  }
  return null;
}

/**
 * Get date range for initial load
 * @param days Number of days to subtract from today
 * @returns Object with from and to dates
 */
export function getDefaultDateRange(days: number = 15): { from: any, to: any } {
  const from = moment(new Date()).subtract(days, 'days').startOf('day');
  const to = moment(new Date()).endOf('day');
  
  return { from, to };
}
