namespace AntShares.Network.RPC
{
    export class RpcClient
    {
        constructor(private url = "http://localhost/") { }

        private static makeRequest(method: string, params: any[]): any
        {
            return { jsonrpc: "2.0", method: method, params: params, id: Math.random() };
        }

        private static send(url: string, request: any)
        {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, false);
            xhr.setRequestHeader('Content-Type', 'application/json-rpc');
            xhr.send(JSON.stringify(request));
            return JSON.parse(xhr.responseText);
        }

        public call(method: string, params: any[]): any
        {
            let response = RpcClient.send(this.url, RpcClient.makeRequest(method, params));
            if (response.error) throw response.error;
            return response.result;
        }

        public callBatch(batch: Array<{ method: string, params: any[] }>): any[]
        {
            let request = [];
            for (let i = 0; i < batch.length; i++)
                request.push(RpcClient.makeRequest(batch[i].method, batch[i].params));
            let response = RpcClient.send(this.url, request);
            if (response.error) throw response.error;
            let results = [];
            for (let i = 0; i < response.length; i++)
            {
                results.push(response[i].result);
            }
            return results;
        }
    }
}
