namespace AntShares.Network.RPC
{
    export class RpcClient
    {
        constructor(private url = "http://localhost/") { }

        private MakeRequest(method: string, params: any[]): any
        {
            return { jsonrpc: "2.0", method: method, params: params, id: Math.random() };
        }

        private Send(request)
        {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", this.url, false);
            xhr.setRequestHeader('Content-Type', 'application/json-rpc');
            xhr.send(JSON.stringify(request));
            return JSON.parse(xhr.responseText);
        }

        public Call(method: string, params: any[]): any
        {
            var response = this.Send(this.MakeRequest(method, params));
            if (response.error) throw response.error;
            return response.result;
        }

        public CallBatch(batch: Array<{ method: string, params: any[] }>): any[]
        {
            var request = [];
            for (var i = 0; i < batch.length; i++)
                request.push(this.MakeRequest(batch[i].method, batch[i].params));
            var response = this.Send(request);
            if (response.error) throw response.error;
            var results = [];
            for (var i = 0; i < response.length; i++)
            {
                results.push(response[i].result);
            }
            return results;
        }
    }
}
