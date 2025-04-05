module.exports = {
    sleep: function (milliseconds) {
        const end = Date.now() + milliseconds;
        while (Date.now() < end) {}
    }
}
