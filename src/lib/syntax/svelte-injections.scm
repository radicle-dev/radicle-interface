; injections.scm
; --------------
((style_element
  (raw_text) @injection.content)
  (#set! injection.language "css")
)

(
  (style_element
    (start_tag
      (attribute
        (quoted_attribute_value (attribute_value))))
    (raw_text) @injection.content)
    (#set! injection.language "css")
)

((attribute
   (attribute_name) @_attr
   (quoted_attribute_value (attribute_value) @injection.content))
   (#set! injection.language "css")
 (#eq? @_attr "style"))

(
  (raw_text_expr) @injection.content
  (#set! injection.language "js")
)

(
  (script_element
    (start_tag
      (attribute
        (quoted_attribute_value (attribute_value) @_lang)
      )
    )
    (raw_text) @injection.content
    (#set! injection.language "ts")
  )
  (#match? @_lang "(ts|typescript)")
)

(
  (script_element
    (raw_text) @injection.content)
    (#set! injection.language "js")
)

(comment) @comment
