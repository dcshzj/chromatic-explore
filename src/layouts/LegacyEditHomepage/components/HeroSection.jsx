import { Droppable, Draggable } from "@hello-pangea/dnd"
import { Button, IconButton } from "@opengovsg/design-system-react"
import PropTypes from "prop-types"

import { FormContext, FormError, FormTitle } from "components/Form"
import FormField from "components/FormField"
import FormFieldMedia from "components/FormFieldMedia"

import styles from "styles/App.module.scss"
import elementStyles from "styles/isomer-cms/Elements.module.scss"

import { isEmpty } from "utils"

import HeroButton from "./HeroButton"
import HeroDropdown from "./HeroDropdown"
import KeyHighlight from "./KeyHighlight"

/* eslint
  react/no-array-index-key: 0
 */

// Constants
const MAX_NUM_KEY_HIGHLIGHTS = 4

const EditorHeroSection = ({
  title,
  subtitle,
  background,
  button,
  url,
  dropdown,
  sectionIndex,
  highlights,
  onFieldChange,
  createHandler,
  deleteHandler,
  shouldDisplay,
  displayHandler,
  displayDropdownElems,
  displayHighlights,
  errors,
  handleHighlightDropdownToggle,
}) => (
  <div
    className={`${elementStyles.card} ${
      !shouldDisplay && !isEmpty(errors.sections[0].hero)
        ? elementStyles.error
        : ""
    }`}
  >
    <div className={elementStyles.cardHeader}>
      <h2>Hero section</h2>
      <IconButton
        variant="clear"
        id={`section-${sectionIndex}`}
        onClick={displayHandler}
      >
        <i
          className={`bx ${
            shouldDisplay ? "bx-chevron-down" : "bx-chevron-right"
          }`}
          id={`section-${sectionIndex}-icon`}
        />
      </IconButton>
    </div>
    {shouldDisplay ? (
      <>
        <FormContext isRequired hasError={!!errors.sections[0].hero.title}>
          <FormTitle>Hero title</FormTitle>
          <FormField
            placeholder="Hero title"
            id={`section-${sectionIndex}-hero-title`}
            value={title}
            onChange={onFieldChange}
          />
          <FormError>{errors.sections[0].hero.title}</FormError>
        </FormContext>
        <FormContext isRequired hasError={!!errors.sections[0].hero.subtitle}>
          <FormTitle>Hero subtitle</FormTitle>
          <FormField
            placeholder="Hero subtitle"
            id={`section-${sectionIndex}-hero-subtitle`}
            value={subtitle}
            onChange={onFieldChange}
          />
          <FormError>{errors.sections[0].hero.subtitle}</FormError>
        </FormContext>
        <FormContext
          hasError={!!errors.sections[0].hero.background}
          onFieldChange={onFieldChange}
          isRequired
        >
          <FormTitle>Hero background image</FormTitle>
          <FormFieldMedia
            value={background}
            id={`section-${sectionIndex}-hero-background`}
            inlineButtonText="Select"
          />
          <FormError>{errors.sections[0].hero.background}</FormError>
        </FormContext>
        <div className={styles.card}>
          <p className={elementStyles.formLabel}>Hero Section Type</p>
          {/* Permalink or File URL */}
          <div className="d-flex">
            <label htmlFor="radio-highlights" className="flex-fill">
              <input
                type="radio"
                id="radio-highlights"
                name="hero-type"
                defaultValue="highlights"
                onChange={handleHighlightDropdownToggle}
                checked={!dropdown}
              />
              Highlights + Button
            </label>
            <label htmlFor="radio-dropdown" className="flex-fill">
              <input
                type="radio"
                id="radio-dropdown"
                name="hero-type"
                defaultValue="dropdown"
                onChange={handleHighlightDropdownToggle}
                checked={!!dropdown}
              />
              Dropdown
            </label>
          </div>
          <span className={elementStyles.info}>
            Note: you can only have either Key Highlights+Hero button or a Hero
            Dropdown
          </span>
        </div>
        <div>
          {dropdown ? (
            <>
              <HeroDropdown
                title={dropdown.title}
                options={dropdown.options}
                sectionIndex={sectionIndex}
                createHandler={createHandler}
                deleteHandler={(event) =>
                  deleteHandler(event, "Dropdown Element")
                }
                onFieldChange={onFieldChange}
                displayDropdownElems={displayDropdownElems}
                displayHandler={displayHandler}
                errors={errors}
              />
            </>
          ) : (
            <>
              <HeroButton
                button={button}
                url={url}
                sectionIndex={sectionIndex}
                onFieldChange={onFieldChange}
                errors={errors.sections[0].hero}
              />
              <Droppable droppableId="highlight" type="highlight">
                {(droppableProvided) => (
                  <div
                    className={styles.card}
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                  >
                    {highlights && highlights.length > 0 ? (
                      <>
                        <b>Hero highlights</b>
                        {highlights.map((highlight, highlightIndex) => (
                          <Draggable
                            draggableId={`highlight-${highlightIndex}-draggable`}
                            index={highlightIndex}
                          >
                            {(draggableProvided) => (
                              <div
                                className={styles.card}
                                key={highlightIndex}
                                {...draggableProvided.draggableProps}
                                {...draggableProvided.dragHandleProps}
                                ref={draggableProvided.innerRef}
                              >
                                <KeyHighlight
                                  key={`highlight-${highlightIndex}`}
                                  title={highlight.title}
                                  description={highlight.description}
                                  background={highlight.background}
                                  url={highlight.url}
                                  highlightIndex={highlightIndex}
                                  onFieldChange={onFieldChange}
                                  shouldDisplay={
                                    displayHighlights[highlightIndex]
                                      ? displayHighlights[highlightIndex]
                                      : false
                                  }
                                  displayHandler={displayHandler}
                                  shouldAllowMoreHighlights={
                                    highlights.length < MAX_NUM_KEY_HIGHLIGHTS
                                  }
                                  deleteHandler={(event) =>
                                    deleteHandler(event, "Highlight")
                                  }
                                  errors={errors.highlights[highlightIndex]}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </>
                    ) : null}
                    {droppableProvided.placeholder}
                    <Button
                      onClick={createHandler}
                      id={`highlight-${highlights.length}-create`}
                      isDisabled={highlights.length >= MAX_NUM_KEY_HIGHLIGHTS}
                      w="100%"
                    >
                      Add highlight
                    </Button>
                  </div>
                )}
              </Droppable>
            </>
          )}
        </div>
      </>
    ) : null}
  </div>
)

export default EditorHeroSection

EditorHeroSection.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  background: PropTypes.string,
  button: PropTypes.string,
  url: PropTypes.string,
  sectionIndex: PropTypes.number.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  createHandler: PropTypes.func.isRequired,
  deleteHandler: PropTypes.func.isRequired,
  shouldDisplay: PropTypes.bool.isRequired,
  displayHandler: PropTypes.func.isRequired,
  displayHighlights: PropTypes.arrayOf(PropTypes.bool),
  displayDropdownElems: PropTypes.arrayOf(PropTypes.bool),
  highlights: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      url: PropTypes.string,
      highlightIndex: PropTypes.number,
      createHandler: PropTypes.func,
      deleteHandler: PropTypes.func,
      onFieldChange: PropTypes.func,
      allowMoreHighlights: PropTypes.bool,
    })
  ),
  dropdown: PropTypes.shape({
    options: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        url: PropTypes.string,
        dropdownsIndex: PropTypes.number,
        onFieldChange: PropTypes.func,
      })
    ),
    title: PropTypes.string.isRequired,
  }),
  errors: PropTypes.shape({
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        hero: PropTypes.shape({
          title: PropTypes.string,
          subtitle: PropTypes.string,
          background: PropTypes.string,
          button: PropTypes.string,
          url: PropTypes.string,
          dropdown: PropTypes.string,
        }),
      })
    ),
    highlights: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        url: PropTypes.string,
      })
    ),
  }).isRequired,
}

EditorHeroSection.defaultProps = {
  highlights: undefined,
  dropdown: undefined,
}
