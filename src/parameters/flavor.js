module.exports = function(input, passthrough) {
    var output = { pass: false, value: null }
    if (passthrough.flavors.get(input)) { output.pass = true; output.value = input; }
    return output;
}