import {asyncHandler} from "../../lib/util.js";
import {NotFoundError} from "../../lib/error-definitions.js";
import { recordListingView } from './listingViewService.js';

export const incrementListingViews = asyncHandler(async (req, res) => {
    const {id} =  req.params;

    const result = await recordListingView(req, id);

    if (!result) {
        throw new NotFoundError("Listing not found")
    }

    res.status(200).json({
        success: true,
        counted: result.counted,
        message: result.counted
        ? "Listing view recorded"
        : "Listing already viewed or viewer not identified",
        ...(result.views !== undefined && {
            data: {
                views: result.views,
            },
        }),
    });
});
