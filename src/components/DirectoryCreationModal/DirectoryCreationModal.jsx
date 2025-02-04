import { yupResolver } from "@hookform/resolvers/yup"
import axios from "axios"
import PropTypes from "prop-types"
import { useState } from "react"
import { useFieldArray, useForm, FormProvider } from "react-hook-form"

import {
  DirectorySettingsSchema,
  DirectorySettingsModal,
} from "components/DirectorySettingsModal"
import { FolderCard } from "components/FolderCard"
import { Footer } from "components/Footer"
import { LoadingButton } from "components/LoadingButton"

import elementStyles from "styles/isomer-cms/Elements.module.scss"
import adminStyles from "styles/isomer-cms/pages/Admin.module.scss"
import contentStyles from "styles/isomer-cms/pages/Content.module.scss"

import { getDirectoryCreationType } from "utils/directoryUtils"

import { pageFileNameToTitle } from "utils"

// axios settings
axios.defaults.withCredentials = true

// eslint-disable-next-line import/prefer-default-export
export const DirectoryCreationModal = ({
  params,
  onClose,
  dirsData,
  pagesData,
  onProceed,
  showSelectPages,
}) => {
  const {
    siteName,
    collectionName,
    resourceRoomName,
    mediaDirectoryName,
  } = params

  const [isSelectingPages, setIsSelectingPages] = useState(false)

  const existingTitlesArray = dirsData.map((item) => item.name)

  const methods = useForm({
    mode: "onTouched",
    resolver: yupResolver(DirectorySettingsSchema(existingTitlesArray)),
    context: {
      type: getDirectoryCreationType(
        mediaDirectoryName,
        resourceRoomName,
        collectionName
      ),
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: methods.control,
  })

  /** ******************************** */
  /*     handler functions    */
  /** ******************************** */

  const onSubmit = (data) => {
    return onProceed({
      data,
      mediaDirectoryName,
    })
  }

  // Sub-component used here for clarity
  const FolderContents = () => {
    if (pagesData && pagesData.length > 0) {
      return pagesData.map((pageData, pageIdx) => (
        <FolderCard
          displayText={pageFileNameToTitle(pageData.name)}
          settingsToggle={() => {}}
          key={pageData.name}
          pageType="file"
          siteName={siteName}
          itemIndex={pageIdx}
          selectedIndex={
            fields.findIndex((item) => item.name === pageData.name) !== -1
              ? fields.findIndex((item) => item.name === pageData.name) + 1
              : null
          }
          onClick={() => {
            const indexOfItem = fields.findIndex(
              (item) => item.name === pageData.name
            )

            if (indexOfItem !== -1) {
              remove(indexOfItem)
            } else {
              append({ name: pageData.name, type: "file" })
            }
          }}
        />
      ))
    }

    if (pagesData) {
      return "There are no pages in this folder."
    }

    return "Loading Pages..."
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...methods}>
      {!isSelectingPages && (
        <DirectorySettingsModal
          isCreate
          params={params}
          dirsData={dirsData}
          onProceed={
            showSelectPages
              ? () => setIsSelectingPages(true)
              : (data) => onProceed(data)
          }
          onClose={onClose}
        />
      )}
      {showSelectPages && isSelectingPages && (
        <div className={elementStyles.overlay}>
          <div className={`${elementStyles.fullscreenWrapper}`}>
            <div
              className={`${adminStyles.adminSidebar} ${elementStyles.wrappedContent} bg-transparent`}
            />
            <div
              className={`${contentStyles.mainSection} ${elementStyles.wrappedContent} bg-light`}
            >
              {/* Page title */}
              <div className={contentStyles.sectionHeader}>
                <h1
                  className={contentStyles.sectionTitle}
                >{`Select pages to add into '${methods.watch(
                  "newDirectoryName"
                )}'`}</h1>
              </div>
              <div className="d-flex justify-content-between w-100">
                <span>Pages will be ordered by the order of selection</span>
              </div>
              <br />
              {/* Pages */}
              <div className={contentStyles.folderContainerBoxes}>
                <div className={contentStyles.boxesContainer}>
                  <FolderContents />
                </div>
              </div>
            </div>
            <Footer position="fixed">
              <LoadingButton onClick={onClose} variant="outline">
                Cancel
              </LoadingButton>
              <LoadingButton onClick={methods.handleSubmit(onSubmit)}>
                {fields.length === 0 ? "Skip" : "Done"}
              </LoadingButton>
            </Footer>
          </div>
        </div>
      )}
    </FormProvider>
  )
}

DirectoryCreationModal.propTypes = {
  parentFolder: PropTypes.string.isRequired,
  existingSubfolders: PropTypes.arrayOf(PropTypes.string).isRequired,
  pagesData: PropTypes.arrayOf(
    PropTypes.shape({
      fileName: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      sha: PropTypes.string,
      title: PropTypes.string,
    })
  ).isRequired,
  siteName: PropTypes.string.isRequired,
  setIsFolderCreationActive: PropTypes.func.isRequired,
}
