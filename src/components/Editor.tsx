import "quill/dist/quill.snow.css";
import Quill, { QuillOptions } from "quill";
import { Delta, Op } from "quill/core";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type EditorValue = {
  image: File | null;
  body: string;
};

interface EditorProps {
  variant?: "create" | "update";
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
  placeholder?: string;
  onCancel?: () => void;
  onSubmit: ({ image, body }: EditorValue) => void;
}

const Editor = ({
  variant = "create",
  defaultValue = [],
  disabled = false,
  innerRef,
  placeholder = "Write something...",
  onCancel,
  onSubmit,
}: EditorProps) => {
  const [_text, setText] = useState("");
  const [_isToolbarVisible, setIsToolbarVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const onSubmitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);

  useLayoutEffect(() => {
    onSubmitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [
            {
              list: "ordered",
            },
            {
              list: "bullet",
            },
          ],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const body = JSON.stringify(quill.getContents());
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  const handleToolbarToggle = () => {
    setIsToolbarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");
    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const quill = quillRef.current;

    quill?.insertText(quill?.getSelection()?.index || 0, emoji);
  };

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white",
          disabled && "opacity-50"
        )}
      >
        <div ref={containerRef} className="h-full ql-custom"></div>
        <div className="flex px-2 pb-2 z-[5]">
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
