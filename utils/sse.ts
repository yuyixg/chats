export function objectToSSE(dataObject: any, eventType = 'message', id = null) {
  let dataJson = JSON.stringify(dataObject);

  let sseData = `event: ${eventType}\ndata: ${dataJson}`;

  if (id !== null) {
    sseData += `\nid: ${id}`;
  }

  sseData += '\n\n';

  return sseData;
}
