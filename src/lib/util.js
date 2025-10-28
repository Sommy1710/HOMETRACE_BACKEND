export const asyncHandler = (fn) => async function (req, res, next)
{
    try {
        return await fn(req, res);
    } catch (error) {
        next(error);
    }
};

export const getSecondsFromNow = (seconds) => {
    const currentTime = new Date();
    currentTime.setSeconds(currentTime.getSeconds() + seconds);
    return currentTime.getTime() / 1000;
};
