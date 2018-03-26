const AV = require('leancloud-storage');
const appId = 'Luwn37983MFGl7WXp5Pc5GfR-gzGzoHsz';
const appKey = 'SnC2PpwJR5qJu1HQedf0m8QC';
AV.init({ appId, appKey });

const Host = AV.Object.extend('Host')
exports.createNewHost = name => {
    const host = new Host()
    host.set('name')
    return host.save()
}
