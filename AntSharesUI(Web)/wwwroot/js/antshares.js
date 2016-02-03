var AntShares = AntShares || {};
AntShares.Network = AntShares.Network || {};
AntShares.Network.RPC = AntShares.Network.RPC || {};
AntShares.Network.RPC.RpcClient = function (url)
{
    if (!url) url = "http://localhost/";

    function MakeRequest(method, params)
    {
        return { jsonrpc: "2.0", method: method, params: params, id: Math.random() };
    }

    function Send(request)
    {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, false);
        xhr.setRequestHeader('Content-Type', 'application/json-rpc');
        xhr.send(JSON.stringify(request));
        return JSON.parse(xhr.responseText);
    }

    this.Call = function (method, params)
    {
        var response = Send(MakeRequest(method, params));
        if (response.error) throw response.error;
        return response.result;
    };

    this.CallBatch = function (batch)
    {
        var request = [];
        for (var i = 0; i < batch.length; i++)
            request.push(MakeRequest(batch[i][0], batch[i][1]));
        var response = Send(request);
        if (response.error) throw response.error;
        var results = [];
        for (var i = 0; i < response.length; i++)
        {
            results.push(response[i].result);
        }
        return results;
    };
};
