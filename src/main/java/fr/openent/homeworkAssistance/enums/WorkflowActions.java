package fr.openent.homeworkAssistance.enums;
import fr.openent.homeworkAssistance.HomeworkAssistance;

public enum WorkflowActions {
    ADMIN(HomeworkAssistance.ADMIN),
    STUDENT(HomeworkAssistance.STUDENT);

    private final String actionName;

    WorkflowActions(String actionName) {
        this.actionName = actionName;
    }

    @Override
    public String toString() {
        return this.actionName;
    }
}
