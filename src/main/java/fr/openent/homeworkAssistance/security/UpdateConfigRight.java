package fr.openent.homeworkAssistance.security;

import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;
import fr.openent.homeworkAssistance.enums.WorkflowActions;
import fr.openent.homeworkAssistance.helper.WorkflowHelper;

public class UpdateConfigRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user, Handler<Boolean> handler) {
        handler.handle(WorkflowHelper.hasRight(user, WorkflowActions.ADMIN.toString()));
    }
}
