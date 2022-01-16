module.exports = (res, code, message, data, total, token, extra) => {
    if (res && code && (data || message)) {
        let obj = {
            code: code
        }
        if (data) obj['data'] = data;
        if (message) obj['message'] = message;
        if (total) obj['total'] = total;
        if (token) obj['token'] = token;
        if (extra) obj['extra'] = extra
        return res.json(obj);
    } else throw 'not proper';
}