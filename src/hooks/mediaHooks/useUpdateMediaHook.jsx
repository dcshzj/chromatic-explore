import _ from "lodash"
import { useContext } from "react"
import { useMutation, useQueryClient } from "react-query"

import { DIR_CONTENT_KEY, MEDIA_CONTENT_KEY } from "constants/queryKeys"

import { ServicesContext } from "contexts/ServicesContext"

import { useSuccessToast, useErrorToast } from "utils/toasts"

import { DEFAULT_RETRY_MSG } from "utils"

import { extractMediaInfo } from "./utils"

// eslint-disable-next-line import/prefer-default-export
export function useUpdateMediaHook(params, queryParams) {
  const queryClient = useQueryClient()
  const { mediaService } = useContext(ServicesContext)
  const successToast = useSuccessToast()
  const errorToast = useErrorToast()
  return useMutation(
    (body) => {
      const { newFileName, sha } = extractMediaInfo(body)
      return mediaService.update(params, { newFileName, sha })
    },
    {
      ...queryParams,
      onSettled: () => {
        queryClient.invalidateQueries([MEDIA_CONTENT_KEY, { ...params }])
      },
      onSuccess: ({ data }) => {
        successToast({
          id: "update-media-file-success",
          description: `Successfully updated media file!`,
        })
        if (params.mediaRoom || params.mediaDirectoryName)
          // update cached media in directory list
          queryClient.setQueryData(
            [DIR_CONTENT_KEY, _.omit(params, "fileName")],
            (oldMediasData) => {
              const oldMediaIndex = oldMediasData.findIndex(
                (media) => media.name === params.fileName
              )
              const newMedia = {
                ...oldMediasData[oldMediaIndex],
                name: data.name,
              }
              // eslint-disable-next-line no-param-reassign
              oldMediasData[oldMediaIndex] = newMedia
              return oldMediasData
            }
          )
        queryClient.invalidateQueries([
          // invalidates media directory
          DIR_CONTENT_KEY,
          _.omit(params, "fileName"),
        ])
        if (queryParams && queryParams.onSuccess) queryParams.onSuccess()
      },
      onError: (err) => {
        if (err.response.status !== 409)
          errorToast({
            id: "update-media-file-error",
            description: `Your media file could not be updated. ${DEFAULT_RETRY_MSG}`,
          })
        if (queryParams && queryParams.onError) queryParams.onError(err)
      },
    }
  )
}
