package fr.openent.homeworkAssistance.controller;
import fr.openent.homeworkAssistance.HomeworkAssistance;
import fr.openent.homeworkAssistance.service.CallbackService;
import fr.openent.homeworkAssistance.service.impl.DefaultCallbackService;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.Trace;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;

public class CallbackController extends ControllerHelper {

    private CallbackService callbackService;

    public CallbackController() {
        super();
        this.callbackService = new DefaultCallbackService();
    }

    @Post("/services/:id/callback")
    @ApiDoc("Send data to Kiamo")
    @SecuredAction(value= "",  type = ActionType.AUTHENTICATED)
//    @SecuredAction(HomeworkAssistance.STUDENT)
//    @Trace("POST_EVENT")
    public void send(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, form -> callbackService.send(form, defaultResponseHandler(request)));
    }
}
