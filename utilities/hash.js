const { hash, compare } = require("bcryptjs")

const makeHash=(value, saltValue)=>{
    const result=hash(value, saltValue)
    return result
}


const makeHashValidation=(value, hashedValue)=>{
    const result=compare(value, hashedValue)
        return result
}
module.exports={makeHash, makeHashValidation}