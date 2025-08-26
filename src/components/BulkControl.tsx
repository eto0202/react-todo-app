import "./BulkControl.css";

type BulkControlProps = {
  onAllDelete: () => void;
};

export function BulkControl({ onAllDelete }: BulkControlProps) {
  return (
    <>
      <div className="bulkControl_wrapper">
        <button className="allDelete_btn" type="button" onClick={onAllDelete}>
          全て削除
        </button>
      </div>
    </>
  );
}
