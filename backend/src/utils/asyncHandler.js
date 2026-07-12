const asyncHandler = (requestFunction) =>{
    return (req, res, next) => {
        Promise.resolve(requestFunction(req, res, next)).catch(next);
    }
}

export {asyncHandler};