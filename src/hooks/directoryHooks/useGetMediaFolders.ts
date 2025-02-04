import { useQuery, UseQueryOptions, UseQueryResult } from "react-query"

import { DIR_CONTENT_KEY } from "constants/queryKeys"

import useRedirectHook from "hooks/useRedirectHook"

import * as DirectoryService from "services/DirectoryService/index"

import { isAxiosError } from "utils/axios"
import { useErrorToast } from "utils/toasts"

import { DirectoryData, MediaData } from "types/directory"
import { MediaDirectoryParams } from "types/folders"
import { DEFAULT_RETRY_MSG } from "utils"

export const useGetMediaFolders = (
  params: MediaDirectoryParams,
  queryOptions?: Omit<
    UseQueryOptions<(DirectoryData | MediaData)[]>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<(DirectoryData | MediaData)[]> => {
  const { setRedirectToNotFound } = useRedirectHook()
  const errorToast = useErrorToast()

  return useQuery<(DirectoryData | MediaData)[]>(
    [DIR_CONTENT_KEY, params],
    () => DirectoryService.getMediaData(params),
    {
      ...queryOptions,
      retry: false,
      onError: (err) => {
        console.log(err)
        if (isAxiosError(err) && err.response && err.response.status === 404) {
          setRedirectToNotFound()
        } else {
          errorToast({
            id: "get-media-directory-error",
            description: `There was a problem retrieving directory contents. ${DEFAULT_RETRY_MSG}`,
          })
        }
        queryOptions?.onError?.(err)
      },
    }
  )
}
