function ErroAlert(e) {
    var index = layer.alert(e, { icon: 5, time: 2000, offset: 't', closeBtn: 0, title: false, btn: false, anim: 2, shade: 0 });
    layer.style(index, {
        color: '#777'
    });
}

//Ajax提交
function AjaxPost(Url,JsonData,ReturnFun,ErrorFun) {
    $.post(Url,JsonData,function (data) {
       ReturnFun(data);
    }).error(function (e) {
        AjaxErro({ Status: "Error", Error: "500" });
        if(ErrorFun){
            ErrorFun();
        }
    });
}

//Ajax 错误返回处理
function AjaxErro(e) {

    if (e.Status == "Error") {
        switch (e.Error) {
            case "500":
                //top.location.href = '/Erro/Erro500';
                break;
            case "100001":
                ErroAlert("错误 : 错误代码 '10001'");
                break;
            default:
                ErroAlert(e.Error);
        }
    } else {
        layer.msg("未知错误！");
    }
}
