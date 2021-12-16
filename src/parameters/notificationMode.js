let modes = [
    'none',
    'discrete',
    'full'
]

module.exports = function(input, passthrough) {
    var output = { pass: false, value: null }
    if (modes.includes(input.toLowerCase())) { output.pass = true; output.value = input.toLowerCase() }
    return output;
}